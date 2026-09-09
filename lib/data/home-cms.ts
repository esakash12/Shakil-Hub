import "server-only";
import { HomeCmsData, DEFAULT_HOME_CMS } from "./home-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./home-cms-types";

/**
 * Reads persistent Home CMS content directly from PostgreSQL with fallback
 */
export async function getPersistentHomeCms(): Promise<HomeCmsData> {
  try {
    if (prisma && (await isPrismaReady())) {
      const record = await prisma.platformSetting.findUnique({
        where: { key: "home_cms" },
      });
      if (record && record.value) {
        return {
          ...DEFAULT_HOME_CMS,
          ...(record.value as any),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentHomeCms error:", err.message || err);
  }

  try {
    const parsed = await readDataFile<HomeCmsData>("home-cms.json", DEFAULT_HOME_CMS);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_HOME_CMS,
        ...parsed,
      };
    }
  } catch (err: any) {
    console.error("Error reading persistent home CMS fallback:", err);
  }
  return DEFAULT_HOME_CMS;
}

/**
 * Updates persistent Home CMS content directly in PostgreSQL
 */
export async function updatePersistentHomeCms(
  updates: Partial<HomeCmsData>
): Promise<HomeCmsData> {
  const current = await getPersistentHomeCms();
  const merged: HomeCmsData = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.platformSetting.upsert({
        where: { key: "home_cms" },
        update: { value: merged as any },
        create: { key: "home_cms", value: merged as any },
      });
    }
  } catch (err: any) {
    console.warn("Prisma updatePersistentHomeCms error:", err.message || err);
  }

  try {
    await writeDataFile("home-cms.json", merged);
  } catch (err) {
    console.error("Failed to write home-cms.json fallback:", err);
  }
  return merged;
}
