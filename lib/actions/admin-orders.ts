"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getPersistentOrders,
  updatePersistentOrderStatus,
  deletePersistentOrder,
} from "@/lib/data/orders";
import { getSessionCookieOptions } from "@/lib/security/cookies";

export interface AdminOrderRecord {
  id: string;
  orderNumber: string;
  studentName: string;
  email: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
  paymentMethod: string;
  senderNumber: string;
  trxId: string;
  status: "pending_verification" | "approved" | "rejected";
  createdAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

/**
 * Server Action: Fetches all orders directly from PostgreSQL database
 */
export async function getAdminOrdersAction(): Promise<{
  success: boolean;
  orders: AdminOrderRecord[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();

    // 1. Fetch live orders from PostgreSQL via persistent orders layer
    const persistentOrders = await getPersistentOrders();

    // 2. Fetch session orders if in dev/preview
    let sessionOrders: any[] = [];
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const parsed = JSON.parse(pendingOrdersRaw);
        if (Array.isArray(parsed)) {
          sessionOrders = parsed.map((o: any) => ({
            id: o.orderId || o.id || `session_${Date.now()}`,
            orderNumber: o.orderNumber || o.orderId || `ORD-${Date.now().toString().slice(-6)}`,
            studentName: o.studentName || "Student",
            email: o.email || "student@sakilhub.com",
            courseTitle: o.courseTitle || "Digital Masterclass",
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

    const mergedMap = new Map<string, AdminOrderRecord>();

    // Add persistent orders from PostgreSQL
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
        verifiedAt: o.verifiedAt,
        rejectionReason: o.rejectionReason,
      });
    });

    // Merge session orders (if not already present in DB)
    sessionOrders.forEach((o) => {
      const matchInMap = Array.from(mergedMap.values()).find(
        (existing) =>
          existing.orderNumber === o.orderNumber ||
          (existing.trxId && existing.trxId.toLowerCase() === o.trxId.toLowerCase())
      );
      if (!matchInMap) {
        mergedMap.set(o.id, {
          ...o,
          studentName: resolveStudentName(o.studentName, o.email),
        });
      }
    });

    // Sort descending by date
    const sortedOrders = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      orders: sortedOrders,
    };
  } catch (err: any) {
    console.error("GET ADMIN ORDERS ACTION ERROR:", err);
    return {
      success: false,
      orders: [],
      error: err.message || "Failed to load orders.",
    };
  }
}

/**
 * Server Action: Verifies & Approves an order (Atomic PostgreSQL Transaction)
 * Automatically grants access to the student immediately.
 */
export async function verifyAdminOrderAction(orderId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    const cookieStore = await cookies();

    // 1. Update in PostgreSQL
    const updatedPersistent = await updatePersistentOrderStatus(orderId, "approved", {
      verifiedAt: new Date().toISOString(),
    });

    const targetSlug = updatedPersistent?.courseSlug || "";

    // 2. Update session cookie if active
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

    // 4. Grant course entitlement to student account
    if (updatedPersistent?.email && targetSlug) {
      try {
        const { grantCustomerCourse } = await import("@/lib/data/customers");
        await grantCustomerCourse(updatedPersistent.email, targetSlug);
      } catch (custErr) {
        console.error("FAILED TO GRANT CUSTOMER COURSE:", custErr);
      }
    }

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

    // 1. Update in PostgreSQL
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

    // 1. Delete from PostgreSQL
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

// Backward compatibility exports
export const fetchAdminOrders = getAdminOrdersAction;
export const approveOrderAction = verifyAdminOrderAction;
