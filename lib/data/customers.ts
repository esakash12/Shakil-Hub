import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { writeDataFile } from "./storage-helper";

export interface CustomerNotice {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  createdAt: string;
  read?: boolean;
}

export interface CustomerRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  status?: "active" | "banned" | "temp_banned";
  banReason?: string;
  tempBanUntil?: string;
  customEnrolledSlugs?: string[];
  revokedSlugs?: string[];
  notices?: CustomerNotice[];
  createdAt: string;
  updatedAt?: string;
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const CUSTOMERS_FILE_PATH = path.join(
  process.cwd(),
  "lib",
  "data",
  "customers.json"
);

/**
 * Ensures customers.json exists and returns all registered student customer accounts
 */
export async function getPersistentCustomers(): Promise<CustomerRecord[]> {
  try {
    const data = await fs.readFile(CUSTOMERS_FILE_PATH, "utf8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await writeDataFile("customers.json", []);
    }
  }
  return [];
}

/**
 * Saves or updates a registered customer
 */
export async function savePersistentCustomer(
  customer: Partial<CustomerRecord> & { email: string }
): Promise<CustomerRecord[]> {
  try {
    const existing = await getPersistentCustomers();
    const normalizedEmail = customer.email.toLowerCase().trim();
    const index = existing.findIndex(
      (c) => c.email.toLowerCase().trim() === normalizedEmail
    );

    let updated: CustomerRecord[];
    if (index >= 0) {
      const prev = existing[index];
      const merged: CustomerRecord = {
        ...prev,
        ...customer,
        passwordHash: customer.passwordHash || prev.passwordHash,
        status: customer.status || prev.status || "active",
        customEnrolledSlugs: customer.customEnrolledSlugs || prev.customEnrolledSlugs || [],
        revokedSlugs: customer.revokedSlugs || prev.revokedSlugs || [],
        notices: customer.notices || prev.notices || [],
        updatedAt: new Date().toISOString(),
      };
      updated = [...existing];
      updated[index] = merged;
    } else {
      const newRecord: CustomerRecord = {
        id: customer.id || `std-${Date.now().toString().slice(-6)}`,
        firstName: customer.firstName || "Student",
        lastName: customer.lastName || "",
        email: normalizedEmail,
        phone: customer.phone,
        passwordHash: customer.passwordHash,
        status: customer.status || "active",
        customEnrolledSlugs: customer.customEnrolledSlugs || [],
        revokedSlugs: customer.revokedSlugs || [],
        notices: customer.notices || [],
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [newRecord, ...existing];
    }

    await writeDataFile("customers.json", updated);
    return updated;
  } catch (err) {
    console.error("FAILED TO SAVE PERSISTENT CUSTOMER:", err);
    return [];
  }
}

/**
 * Finds customer record by email
 */
export async function findCustomerByEmail(
  email: string
): Promise<CustomerRecord | null> {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  const existing = await getPersistentCustomers();
  const found = existing.find((c) => c.email.toLowerCase().trim() === normalized);
  if (!found) return null;

  // Auto check temp ban expiry
  if (found.status === "temp_banned" && found.tempBanUntil) {
    const expiry = new Date(found.tempBanUntil).getTime();
    if (Date.now() > expiry) {
      found.status = "active";
      found.banReason = undefined;
      found.tempBanUntil = undefined;
      await savePersistentCustomer(found);
    }
  }

  return found;
}

/**
 * Updates a customer's status
 */
export async function updateCustomerStatus(
  email: string,
  status: "active" | "banned" | "temp_banned",
  banReason?: string,
  tempBanUntil?: string
): Promise<CustomerRecord | null> {
  const customer = await findCustomerByEmail(email);
  if (!customer) {
    // If not found in customers.json, create record
    const newCust: CustomerRecord = {
      id: `std-${Date.now().toString().slice(-6)}`,
      firstName: "Student",
      lastName: "",
      email: email.toLowerCase().trim(),
      status,
      banReason,
      tempBanUntil,
      customEnrolledSlugs: [],
      revokedSlugs: [],
      notices: [],
      createdAt: new Date().toISOString(),
    };
    await savePersistentCustomer(newCust);
    return newCust;
  }

  customer.status = status;
  customer.banReason = banReason;
  customer.tempBanUntil = tempBanUntil;
  await savePersistentCustomer(customer);
  return customer;
}

/**
 * Adds an admin notice to a customer
 */
export async function addCustomerNotice(
  email: string,
  notice: Omit<CustomerNotice, "id" | "createdAt">
): Promise<CustomerNotice | null> {
  const customer = await findCustomerByEmail(email);
  const newNotice: CustomerNotice = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: notice.title,
    message: notice.message,
    type: notice.type || "info",
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (!customer) {
    const newCust: CustomerRecord = {
      id: `std-${Date.now().toString().slice(-6)}`,
      firstName: "Student",
      lastName: "",
      email: email.toLowerCase().trim(),
      status: "active",
      customEnrolledSlugs: [],
      revokedSlugs: [],
      notices: [newNotice],
      createdAt: new Date().toISOString(),
    };
    await savePersistentCustomer(newCust);
    return newNotice;
  }

  customer.notices = [newNotice, ...(customer.notices || [])];
  await savePersistentCustomer(customer);
  return newNotice;
}

/**
 * Deletes or marks a notice as read
 */
export async function deleteCustomerNotice(
  email: string,
  noticeId: string
): Promise<boolean> {
  const customer = await findCustomerByEmail(email);
  if (!customer || !customer.notices) return false;
  customer.notices = customer.notices.filter((n) => n.id !== noticeId);
  await savePersistentCustomer(customer);
  return true;
}

/**
 * Grants access to a specific course
 */
export async function grantCustomerCourse(
  email: string,
  courseSlug: string
): Promise<CustomerRecord | null> {
  const customer = await findCustomerByEmail(email);
  const normalizedSlug = courseSlug.trim().toLowerCase();

  if (!customer) {
    const newCust: CustomerRecord = {
      id: `std-${Date.now().toString().slice(-6)}`,
      firstName: "Student",
      lastName: "",
      email: email.toLowerCase().trim(),
      status: "active",
      customEnrolledSlugs: [normalizedSlug],
      revokedSlugs: [],
      notices: [],
      createdAt: new Date().toISOString(),
    };
    await savePersistentCustomer(newCust);
    return newCust;
  }

  const customEnrolled = customer.customEnrolledSlugs || [];
  if (!customEnrolled.includes(normalizedSlug)) {
    customer.customEnrolledSlugs = [...customEnrolled, normalizedSlug];
  }
  // Remove from revoked if it was revoked previously
  customer.revokedSlugs = (customer.revokedSlugs || []).filter(
    (s) => s.toLowerCase() !== normalizedSlug
  );

  await savePersistentCustomer(customer);
  return customer;
}

/**
 * Revokes access to a specific course
 */
export async function revokeCustomerCourse(
  email: string,
  courseSlug: string
): Promise<CustomerRecord | null> {
  const customer = await findCustomerByEmail(email);
  const normalizedSlug = courseSlug.trim().toLowerCase();

  if (!customer) {
    const newCust: CustomerRecord = {
      id: `std-${Date.now().toString().slice(-6)}`,
      firstName: "Student",
      lastName: "",
      email: email.toLowerCase().trim(),
      status: "active",
      customEnrolledSlugs: [],
      revokedSlugs: [normalizedSlug],
      notices: [],
      createdAt: new Date().toISOString(),
    };
    await savePersistentCustomer(newCust);
    return newCust;
  }

  // Remove from customEnrolled
  customer.customEnrolledSlugs = (customer.customEnrolledSlugs || []).filter(
    (s) => s.toLowerCase() !== normalizedSlug
  );

  const revoked = customer.revokedSlugs || [];
  if (!revoked.includes(normalizedSlug)) {
    customer.revokedSlugs = [...revoked, normalizedSlug];
  }

  await savePersistentCustomer(customer);
  return customer;
}

/**
 * Permanently deletes a customer
 */
export async function deletePersistentCustomer(email: string): Promise<boolean> {
  try {
    const existing = await getPersistentCustomers();
    const normalized = email.toLowerCase().trim();
    const filtered = existing.filter(
      (c) => c.email.toLowerCase().trim() !== normalized
    );
    await writeDataFile("customers.json", filtered);
    return true;
  } catch (err) {
    console.error("FAILED TO DELETE PERSISTENT CUSTOMER:", err);
    return false;
  }
}

/**
 * Clears all persistent customer accounts for a completely fresh reset
 */
export async function clearAllPersistentCustomers(): Promise<void> {
  try {
    await writeDataFile("customers.json", []);
  } catch (err) {
    console.error("FAILED TO CLEAR PERSISTENT CUSTOMERS:", err);
  }
}
