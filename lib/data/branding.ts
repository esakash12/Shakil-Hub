import "server-only";
import {
  PlatformBrandingSettings,
  DEFAULT_BRANDING,
} from "./branding-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./branding-types";

/**
 * Reads persistent platform branding directly from PostgreSQL with fallback to defaults
 */
export async function getPersistentBranding(): Promise<PlatformBrandingSettings> {
  try {
    if (prisma && (await isPrismaReady())) {
      const record = await prisma.platformSetting.findUnique({
        where: { key: "branding" },
      });
      if (record && record.value) {
        return {
          ...DEFAULT_BRANDING,
          ...(record.value as any),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentBranding error:", err.message || err);
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
    console.error("Error reading persistent branding fallback:", err);
  }

  return DEFAULT_BRANDING;
}

/**
 * Updates persistent platform branding directly in PostgreSQL
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
    if (prisma && (await isPrismaReady())) {
      await prisma.platformSetting.upsert({
        where: { key: "branding" },
        update: { value: merged as any },
        create: { key: "branding", value: merged as any },
      });
    }
  } catch (err: any) {
    console.warn("Prisma updatePersistentBranding error:", err.message || err);
  }

  try {
    await writeDataFile("branding.json", merged);
  } catch (err) {
    console.error("Failed to write branding.json fallback:", err);
  }

  return merged;
}