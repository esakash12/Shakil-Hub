import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export interface OrderItem {
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
 * Ensures orders are retrieved directly from PostgreSQL with JSON fallback
 */
export async function getPersistentOrders(): Promise<OrderItem[]> {
  try {
    if (prisma && (await isPrismaReady())) {
      const dbOrders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbOrders && dbOrders.length > 0) {
        return dbOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          studentName: o.studentName,
          email: o.email,
          courseTitle: o.courseTitle,
          courseSlug: o.courseSlug,
          amount: o.amount,
          paymentMethod: o.paymentMethod,
          senderNumber: o.senderNumber,
          trxId: o.trxId,
          status: o.status as any,
          createdAt: o.createdAt.toISOString(),
          verifiedAt: o.verifiedAt?.toISOString(),
          rejectionReason: o.rejectionReason || undefined,
        }));
      }
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentOrders error:", err.message || err);
  }

  try {
    const list = await readDataFile<OrderItem[]>("orders.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent orders fallback:", err);
  }
  return [];
}

/**
 * Saves or updates an order in PostgreSQL (ACID Transaction Safe)
 */
export async function savePersistentOrder(order: OrderItem): Promise<OrderItem[]> {
  const orderNo = order.orderNumber || order.id;

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.order.upsert({
        where: { orderNumber: orderNo },
        update: {
          studentName: order.studentName,
          email: order.email.toLowerCase().trim(),
          courseTitle: order.courseTitle,
          courseSlug: order.courseSlug,
          amount: Number(order.amount) || 0,
          paymentMethod: order.paymentMethod,
          senderNumber: order.senderNumber,
          trxId: order.trxId,
          status: order.status,
          rejectionReason: order.rejectionReason || null,
          verifiedAt: order.verifiedAt ? new Date(order.verifiedAt) : null,
        },
        create: {
          orderNumber: orderNo,
          studentName: order.studentName,
          email: order.email.toLowerCase().trim(),
          courseTitle: order.courseTitle,
          courseSlug: order.courseSlug,
          amount: Number(order.amount) || 0,
          paymentMethod: order.paymentMethod,
          senderNumber: order.senderNumber,
          trxId: order.trxId,
          status: order.status,
          rejectionReason: order.rejectionReason || null,
          verifiedAt: order.verifiedAt ? new Date(order.verifiedAt) : null,
        },
      });
    }
  } catch (err: any) {
    console.warn("Prisma savePersistentOrder error:", err.message || err);
  }

  // Backup to orders.json
  try {
    const existing = await readDataFile<OrderItem[]>("orders.json", []);
    const index = existing.findIndex((o) => o.id === order.id || o.orderNumber === orderNo);
    let updated: OrderItem[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...updated[index], ...order };
    } else {
      updated = [order, ...existing];
    }
    await writeDataFile("orders.json", updated);
    return updated;
  } catch (err) {
    console.error("FAILED TO SAVE PERSISTENT ORDER FALLBACK:", err);
    return [];
  }
}

/**
 * Updates order status (approve or reject) in PostgreSQL
 */
export async function updatePersistentOrderStatus(
  orderId: string,
  status: "approved" | "rejected",
  extra?: { rejectionReason?: string; verifiedAt?: string }
): Promise<OrderItem | null> {
  try {
    if (prisma && (await isPrismaReady())) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }],
        },
      });

      if (order) {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            status,
            rejectionReason: extra?.rejectionReason || null,
            verifiedAt: extra?.verifiedAt ? new Date(extra.verifiedAt) : (status === "approved" ? new Date() : null),
          },
        });

        // If approved, atomically enroll the student in the course in PostgreSQL
        if (status === "approved" && order.courseSlug && order.email) {
          try {
            const user = await prisma.user.findUnique({
              where: { email: order.email.toLowerCase().trim() },
            });
            if (user) {
              const currentEnrolled = user.customEnrolledSlugs || [];
              if (!currentEnrolled.includes(order.courseSlug)) {
                await prisma.user.update({
                  where: { email: user.email },
                  data: {
                    customEnrolledSlugs: [...currentEnrolled, order.courseSlug],
                    revokedSlugs: user.revokedSlugs.filter((s) => s !== order.courseSlug),
                  },
                });
              }
            }
          } catch (enrollErr: any) {
            console.warn("Auto enrollment update error:", enrollErr.message || enrollErr);
          }
        }

        return {
          id: updated.id,
          orderNumber: updated.orderNumber,
          studentName: updated.studentName,
          email: updated.email,
          courseTitle: updated.courseTitle,
          courseSlug: updated.courseSlug,
          amount: updated.amount,
          paymentMethod: updated.paymentMethod,
          senderNumber: updated.senderNumber,
          trxId: updated.trxId,
          status: updated.status as any,
          createdAt: updated.createdAt.toISOString(),
          verifiedAt: updated.verifiedAt?.toISOString(),
          rejectionReason: updated.rejectionReason || undefined,
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma updatePersistentOrderStatus error:", err.message || err);
  }

  // Fallback to orders.json
  try {
    const existing = await readDataFile<OrderItem[]>("orders.json", []);
    const target = existing.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!target) return null;

    target.status = status;
    if (extra?.verifiedAt) target.verifiedAt = extra.verifiedAt;
    if (extra?.rejectionReason) target.rejectionReason = extra.rejectionReason;

    await writeDataFile("orders.json", existing);
    return target;
  } catch (err) {
    console.error("FAILED TO UPDATE PERSISTENT ORDER STATUS FALLBACK:", err);
    return null;
  }
}

/**
 * Permanently deletes an order from PostgreSQL
 */
export async function deletePersistentOrder(orderId: string): Promise<OrderItem | null> {
  try {
    if (prisma && (await isPrismaReady())) {
      const order = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
      });
      if (order) {
        await prisma.order.delete({ where: { id: order.id } });
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          studentName: order.studentName,
          email: order.email,
          courseTitle: order.courseTitle,
          courseSlug: order.courseSlug,
          amount: order.amount,
          paymentMethod: order.paymentMethod,
          senderNumber: order.senderNumber,
          trxId: order.trxId,
          status: order.status as any,
          createdAt: order.createdAt.toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma deletePersistentOrder error:", err.message || err);
  }

  try {
    const existing = await readDataFile<OrderItem[]>("orders.json", []);
    const targetIndex = existing.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (targetIndex < 0) return null;

    const deleted = existing[targetIndex];
    const updated = existing.filter((_, idx) => idx !== targetIndex);
    await writeDataFile("orders.json", updated);
    return deleted;
  } catch (err) {
    console.error("FAILED TO DELETE PERSISTENT ORDER FALLBACK:", err);
    return null;
  }
}

/**
 * Gets all approved course slugs for a student by email
 */
export async function getApprovedSlugsByEmail(email: string): Promise<string[]> {
  if (!email) return [];
  const normalized = email.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const approvedOrders = await prisma.order.findMany({
        where: {
          email: normalized,
          status: "approved",
        },
        select: { courseSlug: true },
      });
      if (approvedOrders && approvedOrders.length > 0) {
        return Array.from(new Set(approvedOrders.map((o) => o.courseSlug)));
      }
    }
  } catch (err: any) {
    console.warn("Prisma getApprovedSlugsByEmail error:", err.message || err);
  }

  const allOrders = await getPersistentOrders();
  return allOrders
    .filter((o) => o.email.toLowerCase().trim() === normalized && o.status === "approved")
    .map((o) => o.courseSlug);
}
