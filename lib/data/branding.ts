import "server-only";
import {
  PlatformBrandingSettings,
  DEFAULT_BRANDING,
} from "./branding-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./branding-types";

/**
 * Reads persistent platform branding from PostgreSQL via Prisma or storage fallback
 */
export async function getPersistentBranding(): Promise<PlatformBrandingSettings> {
  if (prisma && (await isPrismaReady())) {
    try {
      const setting = await prisma.platformSetting.findUnique({
        where: { key: "branding" },
      });
      if (setting && setting.value && typeof setting.value === "object") {
        return {
          ...DEFAULT_BRANDING,
          ...(setting.value as any),
        };
      }
    } catch (err) {
      console.warn("Prisma branding query failed, falling back to storage:", err);
    }
  }

  try {
    const parsed = await readDataFile<PlatformBrandingSettings>("branding.json", DEFAULT_BRANDING);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_BRANDING,
        ...parsed,
      };
    }
  } catch (err: any) {
    console.error("Error reading persistent branding:", err);
  }

  return DEFAULT_BRANDING;
}

/**
 * Updates persistent platform branding in database and disk
 */
export async function updatePersistentBranding(
  updates: Partial<PlatformBrandingSettings>
): Promise<PlatformBrandingSettings> {
  const current = await getPersistentBranding();
  const merged: PlatformBrandingSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    await writeDataFile("branding.json", merged);
  } catch (err) {
    console.error("Failed to write branding.json:", err);
  }

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.platformSetting.upsert({
        where: { key: "branding" },
        update: { value: merged as any },
        create: { key: "branding", value: merged as any },
      });
    } catch (err) {
      console.warn("Prisma branding upsert warning:", err);
    }
  }

  return merged;
}