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
 * Ensures orders are retrieved from PostgreSQL via Prisma when available,
 * otherwise falls back to persistent storage
 */
export async function getPersistentOrders(): Promise<OrderItem[]> {
  if (prisma && (await isPrismaReady())) {
    try {
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
          verifiedAt: o.verifiedAt ? o.verifiedAt.toISOString() : undefined,
          rejectionReason: o.rejectionReason || undefined,
        }));
      }
    } catch (err) {
      console.warn("Prisma orders query failed, falling back to persistent storage:", err);
    }
  }

  try {
    const list = await readDataFile<OrderItem[]>("orders.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent orders:", err);
  }
  return [];
}

/**
 * Saves or updates an order in orders.json and PostgreSQL via Prisma
 */
export async function savePersistentOrder(order: OrderItem): Promise<OrderItem[]> {
  try {
    const existing = await getPersistentOrders();
    const index = existing.findIndex(
      (o) => o.id === order.id || o.orderNumber === order.orderNumber
    );

    let updated: OrderItem[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...updated[index], ...order };
    } else {
      updated = [order, ...existing];
    }

    await writeDataFile("orders.json", updated);

    if (prisma && (await isPrismaReady())) {
      try {
        const email = order.email.toLowerCase().trim();
        await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            firstName: order.studentName ? order.studentName.split(" ")[0] : "Student",
            lastName: order.studentName ? order.studentName.split(" ").slice(1).join(" ") : "",
            phone: order.senderNumber || "",
            role: "student",
            status: "active",
          },
        });

        await prisma.order.upsert({
          where: { orderNumber: order.orderNumber },
          update: {
            studentName: order.studentName,
            courseTitle: order.courseTitle,
            courseSlug: order.courseSlug,
            amount: order.amount,
            paymentMethod: order.paymentMethod,
            senderNumber: order.senderNumber,
            trxId: order.trxId,
            status: order.status,
            rejectionReason: order.rejectionReason || null,
            verifiedAt: order.verifiedAt ? new Date(order.verifiedAt) : null,
          },
          create: {
            id: order.id,
            orderNumber: order.orderNumber,
            studentName: order.studentName,
            email,
            courseTitle: order.courseTitle,
            courseSlug: order.courseSlug,
            amount: order.amount,
            paymentMethod: order.paymentMethod,
            senderNumber: order.senderNumber,
            trxId: order.trxId,
            status: order.status,
            rejectionReason: order.rejectionReason || null,
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
            verifiedAt: order.verifiedAt ? new Date(order.verifiedAt) : null,
          },
        });
      } catch (syncErr) {
        console.warn("Prisma order sync warning (data saved to JSON):", syncErr);
      }
    }

    return updated;
  } catch (err) {
    console.error("FAILED TO SAVE PERSISTENT ORDER:", err);
    return [];
  }
}

/**
 * Updates order status (e.g. approve or reject)
 */
export async function updatePersistentOrderStatus(
  orderId: string,
  status: "approved" | "rejected",
  extra?: { rejectionReason?: string; verifiedAt?: string }
): Promise<OrderItem | null> {
  try {
    const existing = await getPersistentOrders();
    const target = existing.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );

    if (!target) return null;

    target.status = status;
    if (extra?.verifiedAt) target.verifiedAt = extra.verifiedAt;
    if (extra?.rejectionReason) target.rejectionReason = extra.rejectionReason;

    await writeDataFile("orders.json", existing);

    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.order.updateMany({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
          data: {
            status,
            verifiedAt: extra?.verifiedAt ? new Date(extra.verifiedAt) : undefined,
            rejectionReason: extra?.rejectionReason || undefined,
          },
        });
      } catch (syncErr) {
        console.warn("Prisma update order status warning:", syncErr);
      }
    }

    return target;
  } catch (err) {
    console.error("FAILED TO UPDATE PERSISTENT ORDER STATUS:", err);
    return null;
  }
}

/**
 * Permanently deletes an order from orders.json and database
 */
export async function deletePersistentOrder(
  orderId: string
): Promise<OrderItem | null> {
  try {
    const existing = await getPersistentOrders();
    const targetIndex = existing.findIndex(
      (o) => o.id === orderId || o.orderNumber === orderId
    );

    if (targetIndex < 0) return null;

    const deleted = existing[targetIndex];
    const updated = existing.filter((_, idx) => idx !== targetIndex);
    await writeDataFile("orders.json", updated);

    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.order.deleteMany({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
        });
      } catch (syncErr) {
        console.warn("Prisma delete order warning:", syncErr);
      }
    }

    return deleted;
  } catch (err) {
    console.error("FAILED TO DELETE PERSISTENT ORDER:", err);
    return null;
  }
}

/**
 * Gets all approved course slugs for a student by email
 */
export async function getApprovedSlugsByEmail(email: string): Promise<string[]> {
  if (!email) return [];
  const normalized = email.toLowerCase().trim();
  const allOrders = await getPersistentOrders();
  return allOrders
    .filter(
      (o) =>
        o.email.toLowerCase().trim() === normalized && o.status === "approved"
    )
    .map((o) => o.courseSlug);
}
