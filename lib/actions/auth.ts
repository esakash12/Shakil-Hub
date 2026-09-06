"use server";

import { cookies } from "next/headers";
import { savePersistentCustomer, findCustomerByEmail } from "@/lib/data/customers";
import { getSessionCookieOptions } from "@/lib/security/cookies";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

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
 * Standard Medusa Request Headers Helper
 */
function getMedusaHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (PUBLISHABLE_API_KEY) {
    headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }
  return headers;
}

/**
 * Log in a student customer with Medusa.js backend (Medusa v2)
 */
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // 0. Enforce Administrative Ban Status Gatekeeper
  const existingStatus = await findCustomerByEmail(email);
  if (existingStatus) {
    if (existingStatus.status === "banned") {
      return {
        success: false,
        error: `⛔ Account Suspended: Your student account has been permanently suspended by administration. Reason: ${existingStatus.banReason || "Terms of Service violation"}.`,
      };
    }
    if (existingStatus.status === "temp_banned") {
      const banExpiry = existingStatus.tempBanUntil
        ? new Date(existingStatus.tempBanUntil).toLocaleDateString()
        : "further notice";
      return {
        success: false,
        error: `⏳ Temporary Restriction: Your access is suspended until ${banExpiry}. Reason: ${existingStatus.banReason || "Administrative hold"}.`,
      };
    }
  }

  try {
    let token = "";
    let customerObj: any = null;

    // 1. Medusa v2 Auth Endpoint: POST /auth/customer/emailpass
    const authRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: getMedusaHeaders(),
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const authData = await authRes.json().catch(() => ({}));

    if (authRes.ok && authData.token) {
      token = authData.token;

      // 2. Fetch customer profile with Bearer Token: GET /store/customers/me
      try {
        const profileRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
          method: "GET",
          headers: getMedusaHeaders(token),
          cache: "no-store",
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json().catch(() => ({}));
          customerObj = profileData.customer || profileData;
        } else if (profileRes.status === 404) {
          // If customer record doesn't exist yet, auto-create it
          const createCustRes = await fetch(`${BACKEND_URL}/store/customers`, {
            method: "POST",
            headers: getMedusaHeaders(token),
            body: JSON.stringify({
              email,
              first_name: "Student",
              last_name: "",
            }),
            cache: "no-store",
          });
          if (createCustRes.ok) {
            const createData = await createCustRes.json().catch(() => ({}));
            customerObj = createData.customer || createData;
          }
        }
      } catch {
        // Continue
      }
    } else {
      // 2b. Check persistent customer database (customers.json) fallback
      const existing = await findCustomerByEmail(email);
      if (existing) {
        const { hashPassword } = await import("@/lib/data/customers");
        const hashed = hashPassword(password);
        if (!existing.passwordHash) {
          existing.passwordHash = hashed;
          await savePersistentCustomer(existing);
        }
        if (existing.passwordHash === hashed) {
          const finalProfile = {
            id: existing.id,
            first_name: existing.firstName || "Student",
            last_name: existing.lastName || "",
            email: existing.email,
            phone: existing.phone || "",
          };

          await purgeAllSessionCookies();

          const cookieStore = await cookies();
          const fallbackToken = `std_tok_${Buffer.from(email).toString("base64")}_${Date.now()}`;
          cookieStore.set("sakil_customer_token", fallbackToken, getSessionCookieOptions());
          cookieStore.set("sakil_customer_info", JSON.stringify(finalProfile), getSessionCookieOptions());

          return {
            success: true,
            customer: finalProfile,
          };
        }
      }

      // 3. Medusa v1 Fallback: POST /store/auth
      const v1Res = await fetch(`${BACKEND_URL}/store/auth`, {
        method: "POST",
        headers: getMedusaHeaders(),
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (v1Res.ok) {
        const v1Data = await v1Res.json().catch(() => ({}));
        customerObj = v1Data.customer;
        token = email;
      } else {
        const errorMsg =
          authData.message ||
          "Invalid email or password. Please check your credentials.";
        return {
          success: false,
          error: errorMsg,
        };
      }
    }

    const existing = await findCustomerByEmail(email);
    const { hashPassword } = await import("@/lib/data/customers");

    const finalFirstName = existing?.firstName || customerObj?.first_name || "Student";
    const finalLastName = existing?.lastName !== undefined ? existing.lastName : (customerObj?.last_name || "");
    const finalPhone = existing?.phone || customerObj?.phone || "";

    await savePersistentCustomer({
      id: customerObj?.id || existing?.id || `std-${Date.now().toString().slice(-6)}`,
      firstName: finalFirstName,
      lastName: finalLastName,
      email: customerObj?.email || email,
      phone: finalPhone,
      passwordHash: hashPassword(password),
    });

    // Purge any stale cookies from prior sessions
    await purgeAllSessionCookies();

    // Set Session Token Cookie & Customer Profile Info
    const cookieStore = await cookies();
    cookieStore.set("sakil_customer_token", token, getSessionCookieOptions());

    const finalProfile = {
      id: customerObj?.id || existing?.id,
      first_name: finalFirstName,
      last_name: finalLastName,
      email: customerObj?.email || email,
      phone: finalPhone,
    };

    cookieStore.set("sakil_customer_info", JSON.stringify(finalProfile), getSessionCookieOptions());

    return {
      success: true,
      customer: finalProfile,
    };
  } catch (err: any) {
    // Resilient Fallback: Verify against persistent customer database (customers.json)
    try {
      const existing = await findCustomerByEmail(email);
      if (existing) {
        const { hashPassword } = await import("@/lib/data/customers");
        const hashed = hashPassword(password);
        if (!existing.passwordHash) {
          existing.passwordHash = hashed;
          await savePersistentCustomer(existing);
        }
        const isMatch = existing.passwordHash === hashed;

        if (isMatch) {
          const finalProfile = {
            id: existing.id,
            first_name: existing.firstName || "Student",
            last_name: existing.lastName || "",
            email: existing.email,
            phone: existing.phone || "",
          };

          await purgeAllSessionCookies();

          const cookieStore = await cookies();
          const fallbackToken = `std_tok_${Buffer.from(email).toString("base64")}_${Date.now()}`;
          cookieStore.set("sakil_customer_token", fallbackToken, getSessionCookieOptions());
          cookieStore.set("sakil_customer_info", JSON.stringify(finalProfile), getSessionCookieOptions());

          return {
            success: true,
            customer: finalProfile,
          };
        } else {
          return {
            success: false,
            error: "Invalid email or password. Please check your credentials.",
          };
        }
      }
    } catch {}

    return {
      success: false,
      error:
        "Unable to connect to authentication server. Please create an account or verify your email and password.",
    };
  }
}

/**
 * Register a new student customer with Medusa.js backend (Medusa v2)
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
    let token = "";
    let customerObj: any = null;

    // Step 1 (Medusa v2): Register auth credentials with Auth Module
    const authRes = await fetch(
      `${BACKEND_URL}/auth/customer/emailpass/register`,
      {
        method: "POST",
        headers: getMedusaHeaders(),
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      }
    );

    const authData = await authRes.json().catch(() => ({}));

    if (authRes.ok && authData.token) {
      token = authData.token;

      // Step 2 (Medusa v2): Create customer profile with Bearer Authorization
      const customerRes = await fetch(`${BACKEND_URL}/store/customers`, {
        method: "POST",
        headers: getMedusaHeaders(token),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
        cache: "no-store",
      });

      const custData = await customerRes.json().catch(() => ({}));
      customerObj = custData.customer || custData;
    } else {
      // Step 3 (Medusa v1 Fallback): POST /store/customers
      const v1Res = await fetch(`${BACKEND_URL}/store/customers`, {
        method: "POST",
        headers: getMedusaHeaders(),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
        cache: "no-store",
      });

      const v1Data = await v1Res.json().catch(() => ({}));

      if (v1Res.ok) {
        customerObj = v1Data.customer || v1Data;
        token = email;
      } else {
        const errorMsg =
          authData.message ||
          v1Data.message ||
          "Registration failed. Email may already be registered.";
        return {
          success: false,
          error: errorMsg,
        };
      }
    }

    // Save registered customer to persistent directory
    const { hashPassword } = await import("@/lib/data/customers");
    const customerId = customerObj?.id || `std-${Date.now().toString().slice(-6)}`;
    await savePersistentCustomer({
      id: customerId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    });

    // Purge any stale cookies before establishing brand new student session
    await purgeAllSessionCookies();

    // Save session in Cookie & Customer Info
    const cookieStore = await cookies();
    cookieStore.set("sakil_customer_token", token, getSessionCookieOptions());

    const finalProfile = {
      id: customerId,
      first_name: customerObj?.first_name || firstName,
      last_name: customerObj?.last_name || lastName,
      email: customerObj?.email || email,
    };

    cookieStore.set("sakil_customer_info", JSON.stringify(finalProfile), getSessionCookieOptions());

    return {
      success: true,
      customer: finalProfile,
    };
  } catch (err: any) {
    // Resilient Fallback: Register directly into persistent customer directory
    try {
      const existing = await findCustomerByEmail(email);
      if (existing) {
        return {
          success: false,
          error: "An account with this email address already exists. Please log in.",
        };
      }

      const { hashPassword } = await import("@/lib/data/customers");
      const customerId = `std-${Date.now().toString().slice(-6)}`;
      await savePersistentCustomer({
        id: customerId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        passwordHash: hashPassword(password),
        status: "active",
      });

      await purgeAllSessionCookies();

      const fallbackToken = `std_tok_${Buffer.from(email).toString("base64")}_${Date.now()}`;
      const cookieStore = await cookies();
      cookieStore.set("sakil_customer_token", fallbackToken, getSessionCookieOptions());

      const finalProfile = {
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
    } catch {
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
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

    // 1. Read stored customer profile cookie (fastest & reliable)
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

    // 2. If JWT token is present and backend is reachable, query Medusa v2 /store/customers/me
    if (!candidateProfile && token && token.includes(".")) {
      try {
        const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
          method: "GET",
          headers: getMedusaHeaders(token),
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const customer = data.customer || data;
          if (customer && (customer.email || customer.first_name)) {
            candidateProfile = {
              id: customer.id,
              email: customer.email,
              first_name: customer.first_name || "Student",
              last_name: customer.last_name || "",
              phone: customer.phone,
            };
          }
        }
      } catch {}
    }

    // 3. Fallback: decode email from JWT payload
    if (!candidateProfile && token && token.includes(".")) {
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString("utf8")
          );
          const emailFromJwt = decoded.email || decoded.actor_id;
          if (emailFromJwt && emailFromJwt.includes("@")) {
            candidateProfile = {
              email: emailFromJwt,
              first_name: "Student",
              last_name: "",
            };
          }
        }
      } catch {}
    }

    // 4. Fallback: if token is email string
    if (!candidateProfile && token && token.includes("@")) {
      candidateProfile = {
        email: token,
        first_name: "Student",
        last_name: "",
      };
    }

    // 5. Fallback: Lookup persistent directory by token or ID
    if (!candidateProfile && token) {
      try {
        const { getPersistentCustomers } = await import("@/lib/data/customers");
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

    // 6. Last resort fallback for active student token
    if (!candidateProfile && token) {
      candidateProfile = {
        email: "student@sakilhub.com",
        first_name: "Student",
        last_name: "",
      };
    }

    // If no profile could be resolved, return null
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

      // 3. Authoritative Profile Attribute Reconciliation from customers.json
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
 * Update authenticated customer profile in Medusa backend & persistent store
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
    const token = cookieStore.get("sakil_customer_token")?.value;
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

    // Fallback if existingEmail was not found in infoCookie
    if (!existingEmail) {
      const current = await getCustomerProfile();
      if (current?.email) {
        existingEmail = current.email;
        customerId = current.id || customerId;
      }
    }

    // Send update to Medusa backend if token is available
    if (token && token.includes(".")) {
      try {
        const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
          method: "POST",
          headers: getMedusaHeaders(token),
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone: phone || undefined,
          }),
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const cust = data.customer || data;
          existingEmail = cust.email || existingEmail;
          customerId = cust.id || customerId;
        }
      } catch {}
    }

    const updatedProfile: CustomerProfile = {
      id: customerId,
      email: existingEmail || "student@example.com",
      first_name: firstName,
      last_name: lastName,
      phone,
    };

    if (existingEmail) {
      await savePersistentCustomer({
        id: customerId || `std-${Date.now().toString().slice(-6)}`,
        firstName: firstName,
        lastName: lastName,
        email: existingEmail,
        phone: phone,
        forceUpdate: true,
      });
    }

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
