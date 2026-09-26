"use server";

import { cookies } from "next/headers";
import {
  savePersistentCustomer,
  findCustomerByEmail,
  hashPassword,
  verifyPassword,
  updateCustomerPasswordHash,
  getPersistentCustomers,
} from "@/lib/data/customers";
import crypto from "crypto";
import { getSessionCookieOptions } from "@/lib/security/cookies";
import { sendWelcomeEmail, sendRegistrationOtpEmail } from "@/lib/mail";
import {
  createPendingRegistration,
  getPendingRegistration,
  verifyAndConsumePendingRegistration,
} from "@/lib/data/pending-registrations";

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

const STUDENT_SECRET =
  process.env.STUDENT_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  process.env.COOKIE_SECRET ||
  "sakilhub_student_session_secret_2026";

function signStudentToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email.toLowerCase().trim()}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", STUDENT_SECRET)
    .update(payload)
    .digest("hex");
  return `std_v2_${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function verifyStudentToken(token: string): string | null {
  if (!token) return null;
  // Strictly enforce HMAC-SHA256 signature verification for student sessions
  if (token.startsWith("std_v2_")) {
    const raw = token.slice("std_v2_".length);
    const [payloadB64, sig] = raw.split(".");
    if (!payloadB64 || !sig) return null;
    try {
      const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
      const expectedSig = crypto
        .createHmac("sha256", STUDENT_SECRET)
        .update(payload)
        .digest("hex");
      if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        const parts = payload.split(":");
        const email = parts[0]?.toLowerCase().trim();
        const timestamp = Number(parts[1]);
        if (email && timestamp && Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) {
          return email;
        }
      }
    } catch {
      return null;
    }
  }
  return null;
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
    if (existing) {
      // If user has no passwordHash yet (seeded account), initialize it with bcrypt
      if (!existing.passwordHash) {
        const bcryptHash = hashPassword(password);
        existing.passwordHash = bcryptHash;
        await updateCustomerPasswordHash(email, bcryptHash);
      }

      const passResult = verifyPassword(password, existing.passwordHash);

      if (passResult.isValid) {
        // If account had a legacy SHA-256 hash, automatically upgrade to bcrypt!
        if (passResult.needsRehash) {
          const upgradedBcryptHash = hashPassword(password);
          await updateCustomerPasswordHash(email, upgradedBcryptHash);
        }

        const finalProfile: CustomerProfile = {
          id: existing.id,
          first_name: existing.firstName || "Student",
          last_name: existing.lastName || "",
          email: existing.email,
          phone: existing.phone || "",
        };

        await purgeAllSessionCookies();

        const cookieStore = await cookies();
        const token = signStudentToken(email);
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
 * Step 1: Initiates registration by validating details, generating a 6-digit OTP,
 * and dispatching a branded Email Verification Code to the user's inbox.
 */
export async function initiateRegistrationAction(
  formData: FormData
): Promise<{ success: boolean; email?: string; error?: string }> {
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password || !firstName) {
    return { success: false, error: "All required fields must be filled." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    const existing = await findCustomerByEmail(email);
    if (existing) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in.",
      };
    }

    const hashedPassword = hashPassword(password);
    const { otp } = await createPendingRegistration({
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
    });

    // Send 6-digit OTP email
    await sendRegistrationOtpEmail(email, firstName, otp);

    return {
      success: true,
      email,
    };
  } catch (err: any) {
    console.error("INITIATE REGISTRATION ERROR:", err);
    return {
      success: false,
      error: "Failed to send verification code. Please try again.",
    };
  }
}

/**
 * Step 2: Verifies the 6-digit OTP and completes customer account creation in database
 */
export async function completeRegistrationAction(
  email: string,
  otp: string
): Promise<AuthResponse> {
  if (!email || !otp || otp.trim().length === 0) {
    return {
      success: false,
      error: "Email and 6-digit verification code are required.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const verification = await verifyAndConsumePendingRegistration(
      normalizedEmail,
      otp
    );

    if (!verification.valid || !verification.registration) {
      return {
        success: false,
        error: verification.error || "Invalid or expired verification code.",
      };
    }

    const pending = verification.registration;
    const customerId = `std-${Date.now().toString().slice(-6)}`;

    // Create the verified customer in PostgreSQL and storage
    await savePersistentCustomer({
      id: customerId,
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: normalizedEmail,
      passwordHash: pending.passwordHash,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    // Purge any stale cookies
    await purgeAllSessionCookies();

    // Establish student session
    const token = signStudentToken(normalizedEmail);
    const cookieStore = await cookies();
    cookieStore.set("sakil_customer_token", token, getSessionCookieOptions());

    const finalProfile: CustomerProfile = {
      id: customerId,
      first_name: pending.firstName,
      last_name: pending.lastName,
      email: normalizedEmail,
    };

    cookieStore.set(
      "sakil_customer_info",
      JSON.stringify(finalProfile),
      getSessionCookieOptions()
    );

    // Send Welcome Email
    sendWelcomeEmail(
      normalizedEmail,
      `${pending.firstName} ${pending.lastName}`.trim()
    ).catch((mailErr) => {
      console.warn("Welcome email dispatch warning:", mailErr);
    });

    return {
      success: true,
      customer: finalProfile,
    };
  } catch (err: any) {
    console.error("COMPLETE REGISTRATION ERROR:", err);
    return {
      success: false,
      error: "Account verification failed. Please try again.",
    };
  }
}

/**
 * Resends a fresh 6-digit registration OTP to the pending student's email
 */
export async function resendRegistrationOtpAction(
  email: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Valid email address is required." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const pending = await getPendingRegistration(normalizedEmail);
    if (!pending) {
      return {
        success: false,
        error: "Registration session expired. Please fill out the form again.",
      };
    }

    const { otp } = await createPendingRegistration({
      email: pending.email,
      firstName: pending.firstName,
      lastName: pending.lastName,
      passwordHash: pending.passwordHash,
    });

    await sendRegistrationOtpEmail(pending.email, pending.firstName, otp);

    return {
      success: true,
      message: "A new 6-digit verification code has been sent to your email.",
    };
  } catch (err: any) {
    console.error("RESEND REGISTRATION OTP ERROR:", err);
    return {
      success: false,
      error: "Failed to resend verification code. Please try again.",
    };
  }
}

/**
 * Legacy registration action: initiates registration flow
 */
export async function registerAction(formData: FormData): Promise<AuthResponse> {
  const init = await initiateRegistrationAction(formData);
  if (!init.success) {
    return { success: false, error: init.error };
  }
  return { success: true };
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

    // 1. Strict Cryptographic Token Verification
    const verifiedEmail = token ? verifyStudentToken(token) : null;
    if (!verifiedEmail) {
      return null;
    }

    let candidateProfile: CustomerProfile | null = null;

    // 2. Read stored customer profile cookie if matching verified email
    if (infoCookie) {
      try {
        const parsed = JSON.parse(infoCookie);
        if (parsed.email && parsed.email.toLowerCase().trim() === verifiedEmail) {
          candidateProfile = {
            id: parsed.id,
            email: verifiedEmail,
            first_name: parsed.first_name || "Student",
            last_name: parsed.last_name || "",
            phone: parsed.phone,
          };
        }
      } catch {}
    }

    if (!candidateProfile) {
      candidateProfile = {
        email: verifiedEmail,
        first_name: "Student",
        last_name: "",
      };
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

/**
 * Server Action: Allows authenticated student to change their password securely
 */
export async function changeStudentPasswordAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const profile = await getCustomerProfile();
    if (!profile?.email) {
      return { success: false, error: "Your session has expired. Please sign in again." };
    }

    const currentPassword = (formData.get("current_password") as string) || "";
    const newPassword = (formData.get("new_password") as string) || "";
    const confirmPassword = (formData.get("confirm_password") as string) || "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All password fields are required." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match." };
    }

    const customer = await findCustomerByEmail(profile.email);
    if (!customer) {
      return { success: false, error: "Student account not found." };
    }

    const { isValid } = verifyPassword(currentPassword, customer.passwordHash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = hashPassword(newPassword);
    await updateCustomerPasswordHash(profile.email, newHash);

    return {
      success: true,
      message: "Password changed successfully! Please use your new password next time you sign in.",
    };
  } catch (err: any) {
    console.error("CHANGE STUDENT PASSWORD ERROR:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating your password. Please try again.",
    };
  }
}

