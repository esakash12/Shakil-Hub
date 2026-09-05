import "server-only";
import fs from "fs/promises";
import path from "path";
import { HomeCmsData, DEFAULT_HOME_CMS } from "./home-cms-types";

export * from "./home-cms-types";

const HOME_CMS_FILE = path.join(process.cwd(), "lib", "data", "home-cms.json");

/**
 * Reads persistent Home CMS content from disk
 */
export async function getPersistentHomeCms(): Promise<HomeCmsData> {
  try {
    const data = await fs.readFile(HOME_CMS_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === "object") {
      return {
        ...DEFAULT_HOME_CMS,
        ...parsed,
      };
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.writeFile(HOME_CMS_FILE, JSON.stringify(DEFAULT_HOME_CMS, null, 2), "utf8");
    }
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

  await fs.writeFile(HOME_CMS_FILE, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}
