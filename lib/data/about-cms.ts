import "server-only";
import { AboutCmsData, DEFAULT_ABOUT_CMS } from "./about-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./about-cms-types";

/**
 * Reads persistent About CMS content from PostgreSQL via Prisma or storage fallback
 */
export async function getPersistentAboutCms(): Promise<AboutCmsData> {
  if (prisma && (await isPrismaReady())) {
    try {
      const setting = await prisma.platformSetting.findUnique({
        where: { key: "about_cms" },
      });
      if (setting && setting.value && typeof setting.value === "object") {
        return {
          ...DEFAULT_ABOUT_CMS,
          ...(setting.value as any),
        };
      }
    } catch (err) {
      console.warn("Prisma about CMS query failed, falling back to storage:", err);
    }
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
    console.error("Error reading persistent about CMS:", err);
  }
  return DEFAULT_ABOUT_CMS;
}

/**
 * Updates persistent About CMS content in database and disk
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
    await writeDataFile("about-cms.json", merged);
  } catch (err) {
    console.error("Failed to write about-cms.json:", err);
  }

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.platformSetting.upsert({
        where: { key: "about_cms" },
        update: { value: merged as any },
        create: { key: "about_cms", value: merged as any },
      });
    } catch (err) {
      console.warn("Prisma about CMS upsert warning:", err);
    }
  }

  return merged;
}

