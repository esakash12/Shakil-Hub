import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let prismaReadyCache: { status: boolean; checkedAt: number } | null = null;

/**
 * Enterprise Health Check for PostgreSQL connection with short caching
 * to prevent hammering the database on every single request.
 */
export async function isPrismaReady(): Promise<boolean> {
  const now = Date.now();
  if (prismaReadyCache && now - prismaReadyCache.checkedAt < 10000) {
    return prismaReadyCache.status;
  }

  if (!process.env.DATABASE_URL) {
    prismaReadyCache = { status: false, checkedAt: now };
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    prismaReadyCache = { status: true, checkedAt: now };
    return true;
  } catch (err: any) {
    console.warn("PostgreSQL connection check failed:", err.message || err);
    prismaReadyCache = { status: false, checkedAt: now };
    return false;
  }
}
