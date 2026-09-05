import "server-only";
import { AboutCmsData, DEFAULT_ABOUT_CMS } from "./about-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";

export * from "./about-cms-types";

/**
 * Reads persistent About CMS content from disk
 */
export async function getPersistentAboutCms(): Promise<AboutCmsData> {
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

  try {
    await writeDataFile("about-cms.json", merged);
  } catch (err) {
    console.error("Failed to write about-cms.json:", err);
  }
  return merged;
}

