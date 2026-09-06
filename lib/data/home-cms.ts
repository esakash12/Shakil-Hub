import "server-only";
import { HomeCmsData, DEFAULT_HOME_CMS } from "./home-cms-types";
import { readDataFile, writeDataFile } from "./storage-helper";

export * from "./home-cms-types";

/**
 * Reads persistent Home CMS content from disk
 */
export async function getPersistentHomeCms(): Promise<HomeCmsData> {
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
 * Updates persistent Home CMS content on disk
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
  return merged;
}

