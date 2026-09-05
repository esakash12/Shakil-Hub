import { headers } from "next/headers";

/**
 * Lightweight In-Memory Sliding Window Rate Limiter
 * Mitigates brute-force attacks, order spam, and rapid automated submissions.
 */

interface RateLimitRecord {
  timestamps: number[];
}

// Global in-memory cache persisted during server process lifetime
const rateLimitStore = new Map<string, RateLimitRecord>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function pruneExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    const active = record.timestamps.filter((ts) => now - ts < windowMs);
    if (active.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = active;
    }
  }
}

/**
 * Resolves the client IP from standard reverse proxy and CDN headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0].trim();
      if (firstIp) return firstIp;
    }

    const realIp = headerStore.get("x-real-ip");
    if (realIp) return realIp.trim();

    const cfIp = headerStore.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  } catch {}

  return "127.0.0.1";
}

export interface RateLimitResult {
  success: boolean;
  error?: string;
  retryAfterSeconds?: number;
}

/**
 * Validates whether the incoming identifier has exceeded the maximum requests allowed within windowMs.
 *
 * @param identifier Unique IP or token identifier
 * @param maxRequests Maximum requests allowed within window (default 5)
 * @param windowMs Time window in milliseconds (default 60,000ms = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  pruneExpired(windowMs);

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

    return {
      success: false,
      error: "Too many requests. Please wait a moment.",
      retryAfterSeconds,
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });

  return { success: true };
}
