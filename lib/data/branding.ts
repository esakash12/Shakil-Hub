import "server-only";
import {
  PlatformBrandingSettings,
  DEFAULT_BRANDING,
} from "./branding-types";
import { readDataFile, writeDataFile } from "./storage-helper";

export * from "./branding-types";

/**
 * Reads persistent platform branding from disk with fallback to defaults
 */
export async function getPersistentBranding(): Promise<PlatformBrandingSettings> {
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
 * Updates persistent platform branding on disk
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

  return merged;
}