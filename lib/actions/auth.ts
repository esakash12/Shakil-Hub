"use server";

import { cookies } from "next/headers";
import {
  savePersistentCustomer,
  findCustomerByEmail,
  hashPassword,
  getPersistentCustomers,
} from "@/lib/data/customers";
import { getSessionCookieOptions } from "@/lib/security/cookies";

export interface AuthResponse {
  success: boolean;
  error?: string;
  customer?: any;
}

export interface CustomerProfile {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

const SESSION_COOKIE_KEYS = [
  "sakil_customer_token",
  "sakil_customer_info",
  "sakil_enrolled_courses",
  "sakil_completed_lessons",
  "sakil_student_notes",
  "sakil_community_qa",
  "sakil_pending_orders",
  "sakil_wishlist",
  "sakil_cart_id",
  "medusa_cart_id",
  "medusa_jwt",
  "connect.sid",
];

/**
 * Purges all session and user-specific cookies to guarantee complete state isolation
 */
export async function purgeAllSessionCookies(): Promise<void> {
  try {
    const cookieStore = await cookies();
    for (const key of SESSION_COOKIE_KEYS) {
      cookieStore.delete(key);
      cookieStore.set(key, "", { path: "/", maxAge: 0 });
    }
  } catch {}
}

/**
 * Log in a student customer directly with PostgreSQL database
 */
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // 1. Enforce Administrative Ban Status Gatekeeper
  const existing = await findCustomerByEmail(email);
  if (existing) {
    if (existing.status === "banned") {
      return {
        success: false,
        error: `⛔ Account Suspended: Your student account has been permanently suspended by administration. Reason: ${existing.banReason || "Terms of Service violation"}.`,
      };
    }
    if (existing.status === "temp_banned") {
      const banExpiry = existing.tempBanUntil
        ? new Date(existing.tempBanUntil).toLocaleDateString()
        : "further notice";
      return {
        success: false,
        error: `⏳ Temporary Restriction: Your access is suspended until ${banExpiry}. Reason: ${existing.banReason || "Administrative hold"}.`,
      };
    }
  }

  try {
    const hashed = hashPassword(password);

    if (existing) {
      // If user has no passwordHash yet (seeded account), initialize it
      if (!existing.passwordHash) {
        existing.passwordHash = hashed;
        await savePersistentCustomer(existing);
      }

      if (existing.passwordHash === hashed) {
        const finalProfile: CustomerProfile = {
          id: existing.id,
          first_name: existing.firstName || "Student",
          last_name: existing.lastName || "",
          email: existing.email,
          phone: existing.phone || "",
        };

        await purgeAllSessionCookies();

        const cookieStore = await cookies();
        const token = `std_tok_${Buffer.from(email).toString("base64")}_${Date.now()}`;
        cookieStore.set("sakil_customer_token", token, getSessionCookieOptions());
        cookieStore.set("sakil_customer_info", JSON.stringify(finalProfile), getSessionCookieOptions());

        return {
          success: true,
          customer: finalProfile,
        };
      }
    }

    return {
      success: false,
      error: "Invalid email or password. Please check your credentials.",
    };
  } catch (err: any) {
    console.error("LOGIN ACTION ERROR:", err);
    return {
      success: false,
      error: "An error occurred during sign in. Please try again.",
    };
  }
}

/**
 * Register a new student customer directly in PostgreSQL database
 */
export async function registerAction(formData: FormData): Promise<AuthResponse> {
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password || !firstName) {
    return { success: false, error: "All required fields must be filled." };
  }

  try {
    const existing = await findCustomerByEmail(email);
    if (existing) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in.",
      };
    }

    const customerId = `std-${Date.now().toString().slice(-6)}`;
    const hashedPassword = hashPassword(password);

    await savePersistentCustomer({
      id: customerId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      passwordHash: hashedPassword,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    // Purge any stale cookies before establishing brand new student session
    await purgeAllSessionCookies();

    const token = `std_tok_${Buffer.from(email).toString("base64")}_${Date.now()}`;
    const cookieStore = await cookies();
    cookieStore.set("sakil_customer_token", token, getSessionCookieOptions());

    const finalProfile: CustomerProfile = {
      id: customerId,
      first_name: firstName,
      last_name: lastName,
      email: email,
    };

    cookieStore.set("sakil_customer_info", JSON.stringify(finalProfile), getSessionCookieOptions());

    return {
      success: true,
      customer: finalProfile,
    };
  } catch (err: any) {
    console.error("REGISTER ACTION ERROR:", err);
    return {
      success: false,
      error: "Registration failed. Please try again.",
    };
  }
}

/**
 * Log out current customer and purge all session states
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    await purgeAllSessionCookies();
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Fetch authenticated customer profile with administrative status validation
 * Safe for Server Components (RSC) and Server Actions: Never mutates cookies during read queries.
 */
export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sakil_customer_token")?.value;
    const infoCookie = cookieStore.get("sakil_customer_info")?.value;

    if (!token && !infoCookie) {
      return null;
    }

    let candidateProfile: CustomerProfile | null = null;

    // 1. Read stored customer profile cookie
    if (infoCookie) {
      try {
        const parsed = JSON.parse(infoCookie);
        if (parsed.email) {
          candidateProfile = {
            id: parsed.id,
            email: parsed.email,
            first_name: parsed.first_name || "Student",
            last_name: parsed.last_name || "",
            phone: parsed.phone,
          };
        }
      } catch {}
    }

    // 2. Decode email from token if needed
    if (!candidateProfile && token) {
      if (token.startsWith("std_tok_")) {
        try {
          const parts = token.split("_");
          if (parts[2]) {
            const decodedEmail = Buffer.from(parts[2], "base64").toString("utf8");
            if (decodedEmail && decodedEmail.includes("@")) {
              candidateProfile = {
                email: decodedEmail,
                first_name: "Student",
                last_name: "",
              };
            }
          }
        } catch {}
      } else if (token.includes("@")) {
        candidateProfile = {
          email: token,
          first_name: "Student",
          last_name: "",
        };
      }
    }

    // 3. Fallback: Lookup persistent directory by token or ID
    if (!candidateProfile && token) {
      try {
        const allCusts = await getPersistentCustomers();
        const matched = allCusts.find(
          (c) =>
            c.id === token ||
            (c.email && c.email.toLowerCase() === token.toLowerCase())
        );
        if (matched) {
          candidateProfile = {
            id: matched.id,
            email: matched.email,
            first_name: matched.firstName || "Student",
            last_name: matched.lastName || "",
            phone: matched.phone,
          };
        }
      } catch {}
    }

    if (!candidateProfile || !candidateProfile.email) {
      return null;
    }

    // Strict Administrative Ban Check & Authoritative Profile Reconciliation
    const normalizedEmail = candidateProfile.email.toLowerCase().trim();
    const dbCust = await findCustomerByEmail(normalizedEmail);

    if (dbCust) {
      // 1. Permanent Ban Check
      if (dbCust.status === "banned") {
        return null;
      }

      // 2. Temp Ban Check
      if (dbCust.status === "temp_banned") {
        const isStillBanned =
          !dbCust.tempBanUntil ||
          new Date(dbCust.tempBanUntil).getTime() > Date.now();

        if (isStillBanned) {
          return null;
        }
      }

      // 3. Authoritative Profile Attribute Reconciliation
      if (dbCust.firstName) {
        candidateProfile.first_name = dbCust.firstName;
      }
      if (dbCust.lastName !== undefined) {
        candidateProfile.last_name = dbCust.lastName;
      }
      if (dbCust.phone !== undefined) {
        candidateProfile.phone = dbCust.phone;
      }
      if (dbCust.id && !candidateProfile.id) {
        candidateProfile.id = dbCust.id;
      }
    }

    return candidateProfile;
  } catch {
    return null;
  }
}

/**
 * Update authenticated customer profile in persistent PostgreSQL store
 */
export async function updateCustomerProfileAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  customer?: CustomerProfile;
}> {
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";

  if (!firstName) {
    return { success: false, error: "First name cannot be empty." };
  }

  try {
    const cookieStore = await cookies();
    const infoCookie = cookieStore.get("sakil_customer_info")?.value;

    let existingEmail = "";
    let customerId = "";

    if (infoCookie) {
      try {
        const parsed = JSON.parse(infoCookie);
        existingEmail = parsed.email || "";
        customerId = parsed.id || "";
      } catch {}
    }

    if (!existingEmail) {
      const current = await getCustomerProfile();
      if (current?.email) {
        existingEmail = current.email;
        customerId = current.id || customerId;
      }
    }

    if (!existingEmail) {
      return {
        success: false,
        error: "User session expired. Please log in again.",
      };
    }

    const updatedProfile: CustomerProfile = {
      id: customerId || `std-${Date.now().toString().slice(-6)}`,
      email: existingEmail,
      first_name: firstName,
      last_name: lastName,
      phone,
    };

    await savePersistentCustomer({
      id: updatedProfile.id,
      firstName: firstName,
      lastName: lastName,
      email: existingEmail,
      phone: phone,
      forceUpdate: true,
    });

    cookieStore.set("sakil_customer_info", JSON.stringify(updatedProfile), getSessionCookieOptions());

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/dashboard/settings");
      revalidatePath("/dashboard");
    } catch {}

    return {
      success: true,
      customer: updatedProfile,
    };
  } catch (err: any) {
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}

/**
 * Alias for getCustomerProfile
 */
export const getCustomer = getCustomerProfile;

/**
 * Check if a customer is currently authenticated
 */
export async function getCustomerAction(): Promise<{
  isAuthenticated: boolean;
  email?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sakil_customer_token")?.value;
    const info = cookieStore.get("sakil_customer_info")?.value;
    if (token || info) {
      return { isAuthenticated: true, email: token };
    }
    return { isAuthenticated: false };
  } catch {
    return { isAuthenticated: false };
  }
}
