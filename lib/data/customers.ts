import crypto from "crypto";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

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

/**
 * Sanitizes and deduplicates notice records by ID and unique title+message content
 */
export function deduplicateNotices(notices: any[]): CustomerNotice[] {
  if (!Array.isArray(notices)) return [];
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const result: CustomerNotice[] = [];

  for (const n of notices) {
    if (!n) continue;
    const id = n.id ? String(n.id).trim() : "";
    const title = n.title ? String(n.title).trim() : "";
    const message = n.message ? String(n.message).trim() : "";
    const contentKey = `${title.toLowerCase()}:::${message.toLowerCase()}`;

    if (id && seenIds.has(id)) {
      continue;
    }
    if (contentKey !== ":::" && seenContent.has(contentKey)) {
      continue;
    }

    if (id) seenIds.add(id);
    if (contentKey !== ":::") seenContent.add(contentKey);

    result.push({
      id: id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title || "Notice",
      message: message || "",
      type: n.type || "info",
      createdAt: n.createdAt || new Date().toISOString(),
      read: Boolean(n.read),
    });
  }

  return result;
}

/**
 * Retrieves all registered student customer accounts directly from PostgreSQL
 */
export async function getPersistentCustomers(): Promise<CustomerRecord[]> {
  try {
    if (prisma && (await isPrismaReady())) {
      const dbUsers = await prisma.user.findMany({
        where: { role: "student" },
        orderBy: { createdAt: "desc" },
      });
      return (dbUsers || []).map((u) => ({
        id: u.id,
        firstName: u.firstName || "Student",
        lastName: u.lastName || "",
        email: u.email,
        phone: u.phone || undefined,
        passwordHash: u.passwordHash || undefined,
        status: (u.status as any) || "active",
        banReason: u.banReason || undefined,
        tempBanUntil: u.tempBanUntil || undefined,
        customEnrolledSlugs: u.customEnrolledSlugs || [],
        revokedSlugs: u.revokedSlugs || [],
        notices: deduplicateNotices((u.notices as any) || []),
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }));
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentCustomers error:", err.message || err);
  }

  try {
    const list = await readDataFile<CustomerRecord[]>("customers.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent customers fallback:", err);
  }
  return [];
}

/**
 * Saves or updates a registered customer in PostgreSQL
 */
export async function savePersistentCustomer(
  customer: Partial<CustomerRecord> & { email: string; forceUpdate?: boolean }
): Promise<CustomerRecord[]> {
  const normalizedEmail = customer.email.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      const newFirstName = customer.forceUpdate
        ? (customer.firstName ? customer.firstName.trim() : (existingUser?.firstName || "Student"))
        : (customer.firstName && customer.firstName.trim() && customer.firstName.trim() !== "Student"
            ? customer.firstName.trim()
            : (existingUser?.firstName && existingUser.firstName !== "Student" ? existingUser.firstName : (customer.firstName || "Student")));

      const newLastName = customer.forceUpdate
        ? (customer.lastName !== undefined ? customer.lastName.trim() : (existingUser?.lastName || ""))
        : (customer.lastName !== undefined && customer.lastName.trim() !== ""
            ? customer.lastName.trim()
            : (existingUser?.lastName || ""));

      const newPhone = customer.forceUpdate
        ? (customer.phone !== undefined ? customer.phone.trim() : (existingUser?.phone || ""))
        : (customer.phone !== undefined && customer.phone.trim() !== ""
            ? customer.phone.trim()
            : (existingUser?.phone || ""));

      await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          firstName: newFirstName,
          lastName: newLastName,
          phone: newPhone,
          passwordHash: customer.passwordHash || existingUser?.passwordHash || null,
          status: customer.status || existingUser?.status || "active",
          banReason: customer.banReason !== undefined ? customer.banReason : existingUser?.banReason,
          tempBanUntil: customer.tempBanUntil !== undefined ? customer.tempBanUntil : existingUser?.tempBanUntil,
          customEnrolledSlugs: customer.customEnrolledSlugs || existingUser?.customEnrolledSlugs || [],
          revokedSlugs: customer.revokedSlugs || existingUser?.revokedSlugs || [],
          notices: deduplicateNotices((customer.notices as any) || (existingUser?.notices as any) || []) as any,
        },
        create: {
          email: normalizedEmail,
          firstName: newFirstName,
          lastName: newLastName,
          phone: newPhone,
          passwordHash: customer.passwordHash || null,
          role: "student",
          status: customer.status || "active",
          banReason: customer.banReason || null,
          tempBanUntil: customer.tempBanUntil || null,
          customEnrolledSlugs: customer.customEnrolledSlugs || [],
          revokedSlugs: customer.revokedSlugs || [],
          notices: deduplicateNotices((customer.notices as any) || []) as any,
        },
      });
    }
  } catch (err: any) {
    console.warn("Prisma savePersistentCustomer error:", err.message || err);
  }

  // Backup to customers.json
  try {
    const existing = await readDataFile<CustomerRecord[]>("customers.json", []);
    const index = existing.findIndex((c) => c.email.toLowerCase().trim() === normalizedEmail);

    let updated: CustomerRecord[];
    if (index >= 0) {
      const prev = existing[index];
      const merged: CustomerRecord = {
        ...prev,
        ...customer,
        id: customer.id || prev.id,
        firstName: customer.firstName || prev.firstName || "Student",
        lastName: customer.lastName !== undefined ? customer.lastName : (prev.lastName || ""),
        phone: customer.phone !== undefined ? customer.phone : (prev.phone || ""),
        passwordHash: customer.passwordHash || prev.passwordHash,
        status: customer.status || prev.status || "active",
        customEnrolledSlugs: customer.customEnrolledSlugs || prev.customEnrolledSlugs || [],
        revokedSlugs: customer.revokedSlugs || prev.revokedSlugs || [],
        notices: deduplicateNotices(customer.notices || prev.notices || []),
        updatedAt: new Date().toISOString(),
      };
      updated = [...existing];
      updated[index] = merged;
    } else {
      const now = new Date().toISOString();
      const newCustomer: CustomerRecord = {
        id: customer.id || `cust_${Date.now()}`,
        firstName: customer.firstName || "Student",
        lastName: customer.lastName || "",
        email: normalizedEmail,
        phone: customer.phone || "",
        passwordHash: customer.passwordHash || "",
        status: customer.status || "active",
        banReason: customer.banReason,
        tempBanUntil: customer.tempBanUntil,
        customEnrolledSlugs: customer.customEnrolledSlugs || [],
        revokedSlugs: customer.revokedSlugs || [],
        notices: deduplicateNotices(customer.notices || []),
        createdAt: now,
        updatedAt: now,
      };
      updated = [newCustomer, ...existing];
    }
    await writeDataFile("customers.json", updated);
    return updated;
  } catch (err) {
    console.error("FAILED TO SAVE PERSISTENT CUSTOMER FALLBACK:", err);
    return [];
  }
}

/**
 * Finds a customer by email in PostgreSQL
 */
export async function findCustomerByEmail(email: string): Promise<CustomerRecord | null> {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const u = await prisma.user.findUnique({
        where: { email: normalized },
      });
      if (u) {
        return {
          id: u.id,
          firstName: u.firstName || "Student",
          lastName: u.lastName || "",
          email: u.email,
          phone: u.phone || undefined,
          passwordHash: u.passwordHash || undefined,
          status: (u.status as any) || "active",
          banReason: u.banReason || undefined,
          tempBanUntil: u.tempBanUntil || undefined,
          customEnrolledSlugs: u.customEnrolledSlugs || [],
          revokedSlugs: u.revokedSlugs || [],
          notices: deduplicateNotices((u.notices as any) || []),
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma findCustomerByEmail error:", err.message || err);
  }

  const all = await getPersistentCustomers();
  const target = all.find((c) => c.email.toLowerCase().trim() === normalized);
  if (target) {
    return {
      ...target,
      notices: deduplicateNotices(target.notices || []),
    };
  }
  return null;
}

/**
 * Grants course access to a customer account directly in PostgreSQL
 */
export async function grantCustomerCourse(
  email: string,
  courseSlug: string
): Promise<CustomerRecord | null> {
  if (!email || !courseSlug) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedSlug = courseSlug.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (user) {
        const currentEnrolled = user.customEnrolledSlugs || [];
        if (!currentEnrolled.includes(normalizedSlug)) {
          const updated = await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
              customEnrolledSlugs: [...currentEnrolled, normalizedSlug],
              revokedSlugs: user.revokedSlugs.filter((s) => s !== normalizedSlug),
            },
          });
          return {
            id: updated.id,
            firstName: updated.firstName || "Student",
            lastName: updated.lastName || "",
            email: updated.email,
            customEnrolledSlugs: updated.customEnrolledSlugs,
            revokedSlugs: updated.revokedSlugs,
            createdAt: updated.createdAt.toISOString(),
          };
        }
      }
    }
  } catch (err: any) {
    console.warn("Prisma grantCustomerCourse error:", err.message || err);
  }

  // Fallback to customers.json
  const all = await getPersistentCustomers();
  const target = all.find((c) => c.email.toLowerCase().trim() === normalizedEmail);
  if (!target) {
    await savePersistentCustomer({
      email: normalizedEmail,
      firstName: "Student",
      customEnrolledSlugs: [normalizedSlug],
      revokedSlugs: [],
    });
    return findCustomerByEmail(normalizedEmail);
  }

  const enrolled = target.customEnrolledSlugs || [];
  if (!enrolled.includes(normalizedSlug)) {
    target.customEnrolledSlugs = [...enrolled, normalizedSlug];
  }
  target.revokedSlugs = (target.revokedSlugs || []).filter((s) => s !== normalizedSlug);
  await savePersistentCustomer(target);
  return target;
}

/**
 * Revokes course access from a customer account directly in PostgreSQL
 */
export async function revokeCustomerCourse(
  email: string,
  courseSlug: string
): Promise<CustomerRecord | null> {
  if (!email || !courseSlug) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedSlug = courseSlug.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (user) {
        const updated = await prisma.user.update({
          where: { email: normalizedEmail },
          data: {
            customEnrolledSlugs: user.customEnrolledSlugs.filter((s) => s !== normalizedSlug),
            revokedSlugs: user.revokedSlugs.includes(normalizedSlug)
              ? user.revokedSlugs
              : [...user.revokedSlugs, normalizedSlug],
          },
        });
        return {
          id: updated.id,
          firstName: updated.firstName || "Student",
          lastName: updated.lastName || "",
          email: updated.email,
          customEnrolledSlugs: updated.customEnrolledSlugs,
          revokedSlugs: updated.revokedSlugs,
          createdAt: updated.createdAt.toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma revokeCustomerCourse error:", err.message || err);
  }

  const all = await getPersistentCustomers();
  const target = all.find((c) => c.email.toLowerCase().trim() === normalizedEmail);
  if (!target) return null;

  target.customEnrolledSlugs = (target.customEnrolledSlugs || []).filter((s) => s !== normalizedSlug);
  const revoked = target.revokedSlugs || [];
  if (!revoked.includes(normalizedSlug)) {
    target.revokedSlugs = [...revoked, normalizedSlug];
  }

  await savePersistentCustomer(target);
  return target;
}

/**
 * Updates customer status (active, banned, temp_banned) in PostgreSQL
 */
export async function updateCustomerStatus(
  email: string,
  status: "active" | "banned" | "temp_banned",
  banReasonOrExtra?: string | { banReason?: string; tempBanUntil?: string },
  tempBanUntilArg?: string
): Promise<CustomerRecord | null> {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  const banReason =
    typeof banReasonOrExtra === "object"
      ? banReasonOrExtra?.banReason
      : banReasonOrExtra;
  const tempBanUntil =
    typeof banReasonOrExtra === "object"
      ? banReasonOrExtra?.tempBanUntil
      : tempBanUntilArg;

  try {
    if (prisma && (await isPrismaReady())) {
      const updated = await prisma.user.update({
        where: { email: normalized },
        data: {
          status,
          banReason: banReason || null,
          tempBanUntil: tempBanUntil || null,
        },
      });
      return {
        id: updated.id,
        firstName: updated.firstName || "Student",
        lastName: updated.lastName || "",
        email: updated.email,
        status: updated.status as any,
        banReason: updated.banReason || undefined,
        tempBanUntil: updated.tempBanUntil || undefined,
        createdAt: updated.createdAt.toISOString(),
      };
    }
  } catch (err: any) {
    console.warn("Prisma updateCustomerStatus error:", err.message || err);
  }

  const all = await getPersistentCustomers();
  const target = all.find((c) => c.email.toLowerCase().trim() === normalized);
  if (!target) return null;

  target.status = status;
  target.banReason = banReason;
  target.tempBanUntil = tempBanUntil;

  await savePersistentCustomer(target);
  return target;
}

/**
 * Adds an administrative notice to a student in PostgreSQL
 */
export async function addCustomerNotice(
  email: string,
  notice: Omit<CustomerNotice, "id" | "createdAt">
): Promise<CustomerNotice | null> {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  const newNotice: CustomerNotice = {
    ...notice,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const targetTitle = (notice.title || "").trim().toLowerCase();
  const targetMessage = (notice.message || "").trim().toLowerCase();

  try {
    if (prisma && (await isPrismaReady())) {
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (user) {
        const rawNotices = Array.isArray(user.notices) ? (user.notices as any) : [];
        const cleanNotices = deduplicateNotices(rawNotices);
        const filtered = cleanNotices.filter(
          (n) =>
            n.id !== newNotice.id &&
            !(
              (n.title || "").trim().toLowerCase() === targetTitle &&
              (n.message || "").trim().toLowerCase() === targetMessage
            )
        );
        const updatedNotices = [newNotice, ...filtered];
        await prisma.user.update({
          where: { email: normalized },
          data: { notices: updatedNotices as any },
        });
      }
    }
  } catch (err: any) {
    console.warn("Prisma addCustomerNotice error:", err.message || err);
  }

  // Backup directly to customers.json fallback without re-saving to Prisma or duplicating
  try {
    const existing = await readDataFile<CustomerRecord[]>("customers.json", []);
    const index = existing.findIndex((c) => c.email.toLowerCase().trim() === normalized);
    if (index >= 0) {
      const prevNotices = deduplicateNotices(existing[index].notices || []);
      const filtered = prevNotices.filter(
        (n) =>
          n.id !== newNotice.id &&
          !(
            (n.title || "").trim().toLowerCase() === targetTitle &&
            (n.message || "").trim().toLowerCase() === targetMessage
          )
      );
      existing[index].notices = [newNotice, ...filtered];
      await writeDataFile("customers.json", existing);
    }
  } catch (err: any) {
    console.warn("customers.json backup addCustomerNotice error:", err.message || err);
  }

  return newNotice;
}

/**
 * Deletes an administrative notice for a student in PostgreSQL
 */
export async function deleteCustomerNotice(
  email: string,
  noticeId: string
): Promise<boolean> {
  if (!email || !noticeId) return false;
  const normalized = email.toLowerCase().trim();

  let prismaSuccess = false;
  try {
    if (prisma && (await isPrismaReady())) {
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (user && Array.isArray(user.notices)) {
        const rawNotices = user.notices as any[];
        const target = rawNotices.find((n: any) => n.id === noticeId);
        const targetTitle = (target?.title || "").trim().toLowerCase();
        const targetMessage = (target?.message || "").trim().toLowerCase();

        const filtered = deduplicateNotices(rawNotices).filter((n: any) => {
          if (n.id === noticeId) return false;
          if (
            targetTitle &&
            targetMessage &&
            (n.title || "").trim().toLowerCase() === targetTitle &&
            (n.message || "").trim().toLowerCase() === targetMessage
          ) {
            return false;
          }
          return true;
        });

        await prisma.user.update({
          where: { email: normalized },
          data: { notices: filtered as any },
        });
        prismaSuccess = true;
      }
    }
  } catch (err: any) {
    console.warn("Prisma deleteCustomerNotice error:", err.message || err);
  }

  // Also sync backup customers.json file
  try {
    const existing = await readDataFile<CustomerRecord[]>("customers.json", []);
    const index = existing.findIndex((c) => c.email.toLowerCase().trim() === normalized);
    if (index >= 0) {
      const rawNotices = existing[index].notices || [];
      const target = rawNotices.find((n: any) => n.id === noticeId);
      const targetTitle = (target?.title || "").trim().toLowerCase();
      const targetMessage = (target?.message || "").trim().toLowerCase();

      const filtered = deduplicateNotices(rawNotices).filter((n) => {
        if (n.id === noticeId) return false;
        if (
          targetTitle &&
          targetMessage &&
          (n.title || "").trim().toLowerCase() === targetTitle &&
          (n.message || "").trim().toLowerCase() === targetMessage
        ) {
          return false;
        }
        return true;
      });

      existing[index].notices = filtered;
      await writeDataFile("customers.json", existing);
    }
  } catch (err: any) {
    console.warn("customers.json backup deleteCustomerNotice error:", err.message || err);
  }

  return prismaSuccess || true;
}

/**
 * Permanently deletes a customer account from PostgreSQL
 */
export async function deletePersistentCustomer(idOrEmail: string): Promise<boolean> {
  if (!idOrEmail) return false;
  const target = idOrEmail.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.user.deleteMany({
        where: {
          OR: [{ id: idOrEmail }, { email: target }],
        },
      });
    }
  } catch (err: any) {
    console.warn("Prisma deletePersistentCustomer error:", err.message || err);
  }

  try {
    const existing = await readDataFile<CustomerRecord[]>("customers.json", []);
    const filtered = existing.filter(
      (c) => c.id !== idOrEmail && c.email.toLowerCase().trim() !== target
    );
    await writeDataFile("customers.json", filtered);
  } catch {}

  return true;
}
