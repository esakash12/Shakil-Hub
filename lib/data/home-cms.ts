import "server-only";
import { HomeCmsData, DEFAULT_HOME_CMS } from "./home-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./home-cms-types";

/**
 * Reads persistent Home CMS content from PostgreSQL via Prisma or storage fallback
 */
export async function getPersistentHomeCms(): Promise<HomeCmsData> {
  if (prisma && (await isPrismaReady())) {
    try {
      const setting = await prisma.platformSetting.findUnique({
        where: { key: "home_cms" },
      });
      if (setting && setting.value && typeof setting.value === "object") {
        return {
          ...DEFAULT_HOME_CMS,
          ...(setting.value as any),
        };
      }
    } catch (err) {
      console.warn("Prisma home CMS query failed, falling back to storage:", err);
    }
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
    console.error("Error reading persistent home CMS:", err);
  }
  return DEFAULT_HOME_CMS;
}

/**
 * Updates persistent Home CMS content in database and disk
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
    await writeDataFile("home-cms.json", merged);
  } catch (err) {
    console.error("Failed to write home-cms.json:", err);
  }

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.platformSetting.upsert({
        where: { key: "home_cms" },
        update: { value: merged as any },
        create: { key: "home_cms", value: merged as any },
      });
    } catch (err) {
      console.warn("Prisma home CMS upsert warning:", err);
    }
  }

  return merged;
}

