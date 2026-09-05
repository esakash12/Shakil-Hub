"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeString } from "@/lib/security/sanitize";
import { adminLoginSchema } from "@/lib/security/schemas";

import crypto from "crypto";

const ADMIN_COOKIE_NAME = "sakil_admin_token";

const ADMIN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.MEDUSA_API_KEY ||
  process.env.COOKIE_SECRET ||
  "sakilhub_admin_secret_key_2026";

function signAdminToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payload)
    .digest("hex");
  return `adm_v2_${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  // If it's a Medusa JWT token (starts with eyJ...)
  if (token.startsWith("eyJ")) return true;
  // If it's our signed token format
  if (token.startsWith("adm_v2_")) {
    const raw = token.slice("adm_v2_".length);
    const [payloadB64, sig] = raw.split(".");
    if (!payloadB64 || !sig) return false;
    try {
      const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
      const expectedSig = crypto
        .createHmac("sha256", ADMIN_SECRET)
        .update(payload)
        .digest("hex");
      if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        const parts = payload.split(":");
        const timestamp = Number(parts[1]);
        if (timestamp && Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return true;
        }
      }
    } catch {
      return false;
    }
  }
  // Backwards compatibility for dev mode
  if (process.env.NODE_ENV !== "production" && token.startsWith("adm_jwt_")) {
    return true;
  }
  return false;
}

/**
 * Enterprise Admin Authentication Server Actions
 * Bridges Next.js Admin console directly with Medusa v2 Auth Engine
 */
export async function adminLoginAction(formData: FormData) {
  // 1. IP Rate Limiting (Brute-Force Protection: Max 5 login attempts per minute)
  const clientIp = await getClientIp();
  const rateLimit = checkRateLimit(`admin_login_${clientIp}`, 5, 60 * 1000);
  if (!rateLimit.success) {
    return {
      success: false,
      error: rateLimit.error || "Too many login attempts. Please wait a moment.",
    };
  }

  // 2. Anti-XSS & String Sanitization
  const rawEmail = formData.get("email")?.toString() || "";
  const rawPassword = formData.get("password")?.toString() || "";

  const email = sanitizeString(rawEmail).toLowerCase();
  const password = rawPassword.trim();

  // 3. Strict Zod Validation
  const validation = adminLoginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid email or password format.",
    };
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

  let adminJwt = "";

  try {
    // 1. Authenticate with Medusa v2 Admin Auth Engine (POST /auth/user/emailpass)
    const res = await fetch(`${backendUrl}/auth/user/emailpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        adminJwt = data.token;
      }
    }
  } catch (err: any) {
    console.warn("Medusa user auth check failed, using signed fallback:", err.message);
  }

  // 2. Fallback authorization check for configured admin credentials
  const validAdminEmail = (process.env.ADMIN_EMAIL || "admin@sakilhub.com").toLowerCase().trim();
  const validAdminPass = process.env.ADMIN_PASSWORD;

  // In production, ADMIN_PASSWORD MUST be explicitly configured
  const isEnvConfigured = Boolean(validAdminPass);
  const matchesEnvCredentials =
    isEnvConfigured &&
    email === validAdminEmail &&
    password === validAdminPass;

  const isAuthorized = Boolean(adminJwt) || matchesEnvCredentials;

  if (!isAuthorized) {
    if (!isEnvConfigured && !adminJwt) {
      console.error(
        "CRITICAL SECURITY: ADMIN_PASSWORD environment variable is not configured. Fallback login rejected."
      );
      return {
        success: false,
        error:
          "Administrator security lock: ADMIN_PASSWORD is not configured in server environment variables.",
      };
    }
    return {
      success: false,
      error: "Invalid administrator credentials. Access denied.",
    };
  }

  // Generate verified cryptographically signed admin token value
  const finalToken = adminJwt || signAdminToken(email);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, finalToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return {
    success: true,
    token: finalToken,
  };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function getAdminSessionAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
