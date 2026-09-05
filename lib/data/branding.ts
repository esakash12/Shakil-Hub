import "server-only";
import fs from "fs/promises";
import path from "path";
import {
  PlatformBrandingSettings,
  DEFAULT_BRANDING,
} from "./branding-types";

export * from "./branding-types";

const BRANDING_FILE_PATH = path.join(
  process.cwd(),
  "lib",
  "data",
  "branding.json"
);

/**
 * Reads persistent platform branding from disk with fallback to defaults
 */
export async function getPersistentBranding(): Promise<PlatformBrandingSettings> {
  try {
    const data = await fs.readFile(BRANDING_FILE_PATH, "utf8");
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_BRANDING,
        ...parsed,
      };
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.writeFile(
        BRANDING_FILE_PATH,
        JSON.stringify(DEFAULT_BRANDING, null, 2),
        "utf8"
      );
    }
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
    await fs.writeFile(
      BRANDING_FILE_PATH,
      JSON.stringify(merged, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed to write branding.json:", err);
  }

  return merged;
}