import fs from "fs/promises";
import path from "path";

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

const ORDERS_FILE_PATH = path.join(process.cwd(), "lib", "data", "orders.json");

/**
 * Ensures orders.json file exists and returns list of orders
 */
export async function getPersistentOrders(): Promise<OrderItem[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE_PATH, "utf8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // File doesn't exist, initialize empty array
      await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify([], null, 2), "utf8");
    }
  }
  return [];
}

/**
 * Saves or updates an order in orders.json
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

    await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(updated, null, 2), "utf8");
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

    await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(existing, null, 2), "utf8");
    return target;
  } catch (err) {
    console.error("FAILED TO UPDATE PERSISTENT ORDER STATUS:", err);
    return null;
  }
}

/**
 * Permanently deletes an order from orders.json
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
    await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(updated, null, 2), "utf8");
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
