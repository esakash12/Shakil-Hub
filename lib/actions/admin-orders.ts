"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionCookieOptions } from "@/lib/security/cookies";
import {
  getPersistentOrders,
  updatePersistentOrderStatus,
  OrderItem,
} from "@/lib/data/orders";

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

const ADMIN_API_KEY =
  process.env.MEDUSA_API_KEY || "sakil_headless_lms_admin_key";

export interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  studentName: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
  paymentMethod: "bKash" | "Nagad" | "Card" | string;
  senderNumber: string;
  trxId: string;
  status: "pending_verification" | "approved" | "rejected";
  createdAt: string;
}

/**
 * Server Action: Fetches all real orders/enrollments for the Admin workspace
 */
export async function fetchAdminOrders(): Promise<{
  success: boolean;
  orders: AdminOrderRecord[];
}> {
  try {
    const cookieStore = await cookies();
    const persistentOrders: OrderItem[] = await getPersistentOrders();

    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    let sessionOrders: AdminOrderRecord[] = [];
    if (pendingOrdersRaw) {
      try {
        const rawList = JSON.parse(pendingOrdersRaw);
        if (Array.isArray(rawList)) {
          sessionOrders = rawList.map((o: any) => ({
            id: o.orderId || o.id,
            orderNumber: o.orderNumber || o.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            studentName: o.fullName || o.studentName || "Student",
            email: o.email || "student@sakilhub.com",
            courseTitle: o.courseTitle || "Masterclass",
            courseSlug: o.courseSlug || "",
            amount: Number(o.amount) || 1299,
            paymentMethod: o.paymentMethod || "bKash",
            senderNumber: o.senderNumber || "017XXXXXXXX",
            trxId: o.trxId || "TRX-VERIFY",
            status: o.status || "pending_verification",
            createdAt: o.createdAt || new Date().toISOString(),
          }));
        }
      } catch {}
    }

    // Try fetching live Medusa Orders if available
    let medusaOrders: AdminOrderRecord[] = [];
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders?limit=50`, {
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": ADMIN_API_KEY,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          medusaOrders = data.orders.map((o: any) => {
            const meta = o.metadata || {};
            return {
              id: o.id,
              orderNumber: meta.order_reference || `ORD-${o.display_id || o.id.slice(-5)}`,
              studentName: meta.student_name || o.shipping_address?.first_name || "Student",
              email: o.email || "student@sakilhub.com",
              courseTitle: meta.course_title || "Digital Masterclass",
              courseSlug: meta.course_slug || "",
              amount: (o.total || 129900) / 100,
              paymentMethod: meta.payment_method || "bKash",
              senderNumber: meta.sender_number || "017XXXXXXXX",
              trxId: meta.trx_id || "TRX-AUTO",
              status: meta.status || "pending_verification",
              createdAt: o.created_at || new Date().toISOString(),
            };
          });
        }
      }
    } catch {}

    const { getPersistentCustomers } = await import("@/lib/data/customers");
    const persistentCustomers = await getPersistentCustomers();
    const customerMap = new Map(
      persistentCustomers.map((c) => [c.email.toLowerCase().trim(), c])
    );

    const resolveStudentName = (name: string, email: string) => {
      if (name && name !== "Student") return name;
      const matched = customerMap.get(email?.toLowerCase().trim());
      if (matched && matched.firstName && matched.firstName !== "Student") {
        return `${matched.firstName} ${matched.lastName || ""}`.trim();
      }
      return name || "Student";
    };

    // Merge real orders from persistent store, session, and backend
    const mergedMap = new Map<string, AdminOrderRecord>();

    // 1. Add Medusa orders
    medusaOrders.forEach((o) => {
      mergedMap.set(o.id, {
        ...o,
        studentName: resolveStudentName(o.studentName, o.email),
      });
    });

    // 2. Add Persistent orders (from disk store)
    persistentOrders.forEach((o) => {
      mergedMap.set(o.id, {
        id: o.id,
        orderNumber: o.orderNumber,
        studentName: resolveStudentName(o.studentName, o.email),
        email: o.email,
        courseTitle: o.courseTitle,
        courseSlug: o.courseSlug,
        amount: o.amount,
        paymentMethod: o.paymentMethod,
        senderNumber: o.senderNumber,
        trxId: o.trxId,
        status: o.status,
        createdAt: o.createdAt,
      });
    });

    // 3. Add Session orders
    sessionOrders.forEach((o) => {
      mergedMap.set(o.id, {
        ...o,
        studentName: resolveStudentName(o.studentName, o.email),
      });
    });

    const orders = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      orders,
    };
  } catch (err: any) {
    console.error("FETCH ADMIN ORDERS ERROR:", err);
    return {
      success: false,
      orders: [],
    };
  }
}

/**
 * Server Action: Approves an order, verifying the TrxID and granting student course access
 */
export async function approveOrderAction(orderId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const cookieStore = await cookies();

    // 1. Update in persistent disk store
    const updatedPersistent = await updatePersistentOrderStatus(orderId, "approved", {
      verifiedAt: new Date().toISOString(),
    });

    const targetSlug = updatedPersistent?.courseSlug || "";

    // 2. Update in session cookie if present
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const orders: any[] = JSON.parse(pendingOrdersRaw);
        const updated = orders.map((o) => {
          if (o.orderId === orderId || o.id === orderId || o.orderNumber === orderId) {
            return {
              ...o,
              status: "approved",
            };
          }
          return o;
        });

        cookieStore.set("sakil_pending_orders", JSON.stringify(updated), getSessionCookieOptions(60 * 60 * 24 * 30));
      } catch {}
    }

    // 3. Update single order cookie
    const singleOrderRaw = cookieStore.get(`sakil_order_${orderId}`)?.value;
    if (singleOrderRaw) {
      try {
        const single = JSON.parse(singleOrderRaw);
        single.status = "approved";
        cookieStore.set(`sakil_order_${orderId}`, JSON.stringify(single), getSessionCookieOptions());
      } catch {}
    }

    // 4. Grant course directly to persistent student account in customers.json
    if (updatedPersistent?.email) {
      try {
        const { grantCustomerCourse } = await import("@/lib/data/customers");
        await grantCustomerCourse(updatedPersistent.email, targetSlug);
      } catch (custErr) {
        console.error("FAILED TO GRANT PERSISTENT CUSTOMER COURSE:", custErr);
      }
    }

    // 5. Notify Medusa backend if active
    try {
      await fetch(`${BACKEND_URL}/admin/orders/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": ADMIN_API_KEY,
        },
        body: JSON.stringify({
          metadata: {
            status: "approved",
            verified_at: new Date().toISOString(),
          },
        }),
        cache: "no-store",
      });
    } catch {}

    // Revalidate routes
    revalidatePath("/dashboard/pending");
    revalidatePath("/admin/enrollments");
    revalidatePath("/admin");
    revalidatePath("/admin/students");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Order #${orderId} verified successfully! Course access granted to student.`,
    };
  } catch (err: any) {
    console.error("APPROVE ORDER ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to approve order.",
    };
  }
}

/**
 * Server Action: Rejects an order (e.g. invalid TrxID or unpaid transfer)
 */
export async function rejectOrderAction(
  orderId: string,
  reason?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const cookieStore = await cookies();

    // 1. Update persistent store
    await updatePersistentOrderStatus(orderId, "rejected", {
      rejectionReason: reason || "Invalid or unverifiable Transaction ID",
    });

    // 2. Update session cookie
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const orders: any[] = JSON.parse(pendingOrdersRaw);
        const updated = orders.map((o) => {
          if (o.orderId === orderId || o.id === orderId || o.orderNumber === orderId) {
            return {
              ...o,
              status: "rejected",
              rejectionReason: reason || "Invalid or unverifiable Transaction ID",
            };
          }
          return o;
        });

        cookieStore.set("sakil_pending_orders", JSON.stringify(updated), getSessionCookieOptions(60 * 60 * 24 * 30));
      } catch {}
    }

    // 3. Update single order cookie
    const singleOrderRaw = cookieStore.get(`sakil_order_${orderId}`)?.value;
    if (singleOrderRaw) {
      try {
        const single = JSON.parse(singleOrderRaw);
        single.status = "rejected";
        cookieStore.set(`sakil_order_${orderId}`, JSON.stringify(single), getSessionCookieOptions());
      } catch {}
    }

    // Revalidate routes
    revalidatePath("/dashboard/pending");
    revalidatePath("/admin/enrollments");
    revalidatePath("/admin");
    revalidatePath("/admin/students");

    return {
      success: true,
      message: `Order #${orderId} marked as rejected.`,
    };
  } catch (err: any) {
    console.error("REJECT ORDER ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to reject order.",
    };
  }
}

/**
 * Server Action: Hard Deletes an order permanently from database, session, and student entitlements
 */
export async function deleteAdminOrderAction(orderId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const cookieStore = await cookies();

    // 1. Delete from persistent orders.json
    const { deletePersistentOrder } = await import("@/lib/data/orders");
    const deletedOrder = await deletePersistentOrder(orderId);

    // 2. If session cookie has this order, remove it
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const orders: any[] = JSON.parse(pendingOrdersRaw);
        const filtered = orders.filter(
          (o) => o.orderId !== orderId && o.id !== orderId && o.orderNumber !== orderId
        );
        cookieStore.set("sakil_pending_orders", JSON.stringify(filtered), getSessionCookieOptions(60 * 60 * 24 * 30));
      } catch {}
    }

    // 3. Clear single order cookie if exists
    cookieStore.delete(`sakil_order_${orderId}`);

    // 4. If the deleted order was approved, revoke entitlement if no other approved order exists
    if (deletedOrder && deletedOrder.email && deletedOrder.courseSlug) {
      try {
        const { getApprovedSlugsByEmail } = await import("@/lib/data/orders");
        const remainingSlugs = await getApprovedSlugsByEmail(deletedOrder.email);
        if (!remainingSlugs.includes(deletedOrder.courseSlug)) {
          const { revokeCustomerCourse } = await import("@/lib/data/customers");
          await revokeCustomerCourse(deletedOrder.email, deletedOrder.courseSlug);
        }
      } catch {}
    }

    // 5. Attempt deleting on Medusa backend
    try {
      await fetch(`${BACKEND_URL}/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": ADMIN_API_KEY,
        },
        cache: "no-store",
      });
    } catch {}

    // Revalidate routes
    revalidatePath("/dashboard/pending");
    revalidatePath("/admin/enrollments");
    revalidatePath("/admin");
    revalidatePath("/admin/students");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Order #${orderId} has been permanently deleted from the database.`,
    };
  } catch (err: any) {
    console.error("DELETE ADMIN ORDER ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to delete order.",
    };
  }
}
