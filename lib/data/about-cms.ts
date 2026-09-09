import "server-only";
import { AboutCmsData, DEFAULT_ABOUT_CMS } from "./about-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./about-cms-types";

/**
 * Reads persistent About CMS content directly from PostgreSQL with fallback
 */
export async function getPersistentAboutCms(): Promise<AboutCmsData> {
  try {
    if (prisma && (await isPrismaReady())) {
      const record = await prisma.platformSetting.findUnique({
        where: { key: "about_cms" },
      });
      if (record && record.value) {
        return {
          ...DEFAULT_ABOUT_CMS,
          ...(record.value as any),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentAboutCms error:", err.message || err);
  }

  try {
    const parsed = await readDataFile<AboutCmsData>("about-cms.json", DEFAULT_ABOUT_CMS);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_ABOUT_CMS,
        ...parsed,
      };
    }
  } catch (err: any) {
    console.error("Error reading persistent about CMS fallback:", err);
  }
  return DEFAULT_ABOUT_CMS;
}

/**
 * Updates persistent About CMS content directly in PostgreSQL
 */
export async function updatePersistentAboutCms(
  updates: Partial<AboutCmsData>
): Promise<AboutCmsData> {
  const current = await getPersistentAboutCms();
  const merged: AboutCmsData = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.platformSetting.upsert({
        where: { key: "about_cms" },
        update: { value: merged as any },
        create: { key: "about_cms", value: merged as any },
      });
    }
  } catch (err: any) {
    console.warn("Prisma updatePersistentAboutCms error:", err.message || err);
  }

  try {
    await writeDataFile("about-cms.json", merged);
  } catch (err) {
    console.error("Failed to write about-cms.json fallback:", err);
  }
  return merged;
}
