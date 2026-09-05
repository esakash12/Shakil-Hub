import "server-only";
import fs from "fs/promises";
import path from "path";
import { AboutCmsData, DEFAULT_ABOUT_CMS } from "./about-cms-types";

export * from "./about-cms-types";

const ABOUT_CMS_FILE = path.join(process.cwd(), "lib", "data", "about-cms.json");

/**
 * Reads persistent About CMS content from disk
 */
export async function getPersistentAboutCms(): Promise<AboutCmsData> {
  try {
    const data = await fs.readFile(ABOUT_CMS_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_ABOUT_CMS,
        ...parsed,
      };
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.writeFile(ABOUT_CMS_FILE, JSON.stringify(DEFAULT_ABOUT_CMS, null, 2), "utf8");
    }
  }
  return DEFAULT_ABOUT_CMS;
}

/**
 * Updates persistent About CMS content on disk
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

  await fs.writeFile(ABOUT_CMS_FILE, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}
