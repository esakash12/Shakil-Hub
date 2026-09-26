"use server";

import { revalidatePath } from "next/cache";
import {
  getPersistentOrders,
  updatePersistentOrderStatus,
  deletePersistentOrder,
} from "@/lib/data/orders";
import { requireAdminSession } from "@/lib/actions/admin-auth";
import { sendOrderApprovedEmail } from "@/lib/mail";

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
 * Server Action: Fetches all orders directly from PostgreSQL database (Pure DB Architecture)
 */
export async function getAdminOrdersAction(): Promise<{
  success: boolean;
  orders: AdminOrderRecord[];
  error?: string;
}> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, orders: [], error: "Unauthorized. Admin session required." };
  }

  try {
    const persistentOrders = await getPersistentOrders();

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
    const seenTrx = new Set<string>();

    persistentOrders.forEach((o) => {
      const canonicalId = o.orderNumber || o.id;
      const normTrx = (o.trxId || "").trim().toUpperCase();

      if (normTrx && normTrx !== "N/A" && normTrx !== "TRX-VERIFY" && seenTrx.has(normTrx)) {
        return;
      }
      if (normTrx && normTrx !== "N/A" && normTrx !== "TRX-VERIFY") {
        seenTrx.add(normTrx);
      }

      mergedMap.set(canonicalId, {
        id: canonicalId,
        orderNumber: o.orderNumber || canonicalId,
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
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    // 1. Update in PostgreSQL
    const updatedPersistent = await updatePersistentOrderStatus(orderId, "approved", {
      verifiedAt: new Date().toISOString(),
    });

    const targetSlug = updatedPersistent?.courseSlug || "";

    // 2. Grant course entitlement to student account
    if (updatedPersistent?.email && targetSlug) {
      try {
        const { grantCustomerCourse } = await import("@/lib/data/customers");
        await grantCustomerCourse(updatedPersistent.email, targetSlug);
      } catch (custErr) {
        console.error("FAILED TO GRANT CUSTOMER COURSE:", custErr);
      }
    }

    // 3. Send Order Approved Notification Email to Student
    if (updatedPersistent?.email) {
      const isShopProduct =
        targetSlug.startsWith("prod-") ||
        targetSlug.includes("pack") ||
        targetSlug.includes("lut") ||
        targetSlug.includes("preset");

      sendOrderApprovedEmail({
        to: updatedPersistent.email,
        name: updatedPersistent.studentName || "Student",
        orderNumber: updatedPersistent.orderNumber || orderId,
        itemTitle: updatedPersistent.courseTitle || "Masterclass",
        itemType: isShopProduct ? "product" : "course",
        slug: targetSlug,
      }).catch((mailErr) => {
        console.warn("Order approved email dispatch warning:", mailErr);
      });
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
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    // 1. Update in PostgreSQL
    await updatePersistentOrderStatus(orderId, "rejected", {
      rejectionReason: reason || "Invalid or unverifiable Transaction ID",
    });

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
 * Server Action: Hard Deletes an order permanently from database and student entitlements
 */
export async function deleteAdminOrderAction(orderId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  if (!orderId) {
    return { success: false, error: "Order ID is required." };
  }

  try {
    // 1. Delete from PostgreSQL
    const deletedOrder = await deletePersistentOrder(orderId);

    // 2. If the deleted order was approved, revoke entitlement if no other approved order exists
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
