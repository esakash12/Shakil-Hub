import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const isDatabaseUrlConfigured = Boolean(
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.trim() !== "" &&
  !process.env.DATABASE_URL.includes("mock") &&
  !process.env.DATABASE_URL.includes("placeholder")
);

export const prisma: PrismaClient | null = isDatabaseUrlConfigured
  ? (globalThis.__prismaClient ?? new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    }))
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalThis.__prismaClient = prisma;
}

let isDbConnected: boolean | null = null;
let lastCheckTime = 0;
const CHECK_CACHE_MS = 30000; // 30 seconds

/**
 * Checks if Prisma is configured and reachable.
 * Cached for 30s to avoid repeated connection overhead when database is unreachable.
 */
export async function isPrismaReady(): Promise<boolean> {
  if (!prisma) return false;
  const now = Date.now();
  if (isDbConnected !== null && (now - lastCheckTime) < CHECK_CACHE_MS) {
    return isDbConnected;
  }

  try {
    // Fast probe
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    lastCheckTime = now;
    return true;
  } catch (err: any) {
    isDbConnected = false;
    lastCheckTime = now;
    return false;
  }
}
