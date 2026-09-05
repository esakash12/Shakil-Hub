import "server-only";
import fs from "fs/promises";
import path from "path";

export interface CourseFaqItem {
  question: string;
  answer: string;
}

export interface CourseCmsOverride {
  subtitle?: string;
  badge?: string;
  category?: string;
  level?: string;
  mainSlogan?: string;
  heroSlogan?: string;
  numericPrice?: number;
  numericOriginalPrice?: number;
  discountPct?: string;
  instructorId?: string;
  instructorName?: string;
  instructorRole?: string;
  instructorAvatar?: string;
  highlights?: {
    hours?: string;
    lessons?: string;
    access?: string;
    certificate?: string;
  };
  faqs?: CourseFaqItem[];
  curriculum?: any[];
}

export type CoursesCmsMap = Record<string, CourseCmsOverride>;

const COURSES_CMS_FILE = path.join(process.cwd(), "lib", "data", "courses-cms.json");

/**
 * Reads all course CMS overrides from disk
 */
export async function getPersistentCoursesCms(): Promise<CoursesCmsMap> {
  try {
    const data = await fs.readFile(COURSES_CMS_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.writeFile(COURSES_CMS_FILE, JSON.stringify({}, null, 2), "utf8");
    }
  }
  return {};
}

/**
 * Gets CMS override for a single course slug or id
 */
export async function getCourseCmsOverride(slugOrId: string): Promise<CourseCmsOverride | null> {
  if (!slugOrId) return null;
  const all = await getPersistentCoursesCms();
  return all[slugOrId] || null;
}

/**
 * Saves or updates CMS override for a course slug or id
 */
export async function saveCourseCmsOverride(
  slugOrId: string,
  updates: Partial<CourseCmsOverride>
): Promise<CourseCmsOverride> {
  const all = await getPersistentCoursesCms();
  const existing = all[slugOrId] || {};

  const merged: CourseCmsOverride = {
    ...existing,
    ...updates,
    highlights: {
      ...(existing.highlights || {}),
      ...(updates.highlights || {}),
    },
    faqs: updates.faqs !== undefined ? updates.faqs : existing.faqs,
    curriculum: updates.curriculum !== undefined ? updates.curriculum : existing.curriculum,
  };

  all[slugOrId] = merged;
  await fs.writeFile(COURSES_CMS_FILE, JSON.stringify(all, null, 2), "utf8");
  return merged;
}

/**
 * Deletes CMS override for a course slug or id permanently
 */
export async function deleteCourseCmsOverride(slugOrId: string): Promise<boolean> {
  if (!slugOrId) return false;
  const all = await getPersistentCoursesCms();
  const normalized = slugOrId.toLowerCase().trim();
  let changed = false;

  for (const key of Object.keys(all)) {
    if (key.toLowerCase().trim() === normalized) {
      delete all[key];
      changed = true;
    }
  }

  if (changed) {
    await fs.writeFile(COURSES_CMS_FILE, JSON.stringify(all, null, 2), "utf8");
  }
  return changed;
}
