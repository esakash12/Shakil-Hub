import { readDataFile, writeDataFile } from "./storage-helper";

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
 * Ensures orders.json file exists and returns list of orders
 */
export async function getPersistentOrders(): Promise<OrderItem[]> {
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

    await writeDataFile("orders.json", updated);
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
    await writeDataFile("orders.json", updated);
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
