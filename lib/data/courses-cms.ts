import "server-only";
import fs from "fs/promises";
import path from "path";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export interface CourseFaqItem {
  question: string;
  answer: string;
}

export interface CourseCmsOverride {
  title?: string;
  subtitle?: string;
  badge?: string;
  category?: string;
  level?: string;
  price?: string;
  originalPrice?: string;
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

/**
 * Reads all course CMS overrides from disk/database
 */
export async function getPersistentCoursesCms(): Promise<CoursesCmsMap> {
  if (prisma && (await isPrismaReady())) {
    try {
      const dbCourses = await prisma.course.findMany();
      if (dbCourses && dbCourses.length > 0) {
        const result: CoursesCmsMap = {};
        for (const c of dbCourses) {
          result[c.slug] = {
            title: c.title,
            subtitle: c.subtitle || "",
            badge: c.badge || "",
            category: c.category,
            level: c.level,
            numericPrice: c.numericPrice,
            numericOriginalPrice: c.numericOriginalPrice,
            discountPct: c.discountPct || "",
            instructorId: c.instructorId || "",
            instructorName: c.instructorName || "",
            highlights: (c.highlights as any) || {},
            faqs: (c.faqs as any) || [],
            curriculum: (c.curriculum as any) || [],
          };
        }
        return result;
      }
    } catch (err) {
      console.warn("Prisma courses query failed, falling back to file store:", err);
    }
  }

  try {
    const data = await readDataFile<CoursesCmsMap>("courses-cms.json", {});
    if (data && typeof data === "object") {
      return data;
    }
  } catch (err: any) {
    console.error("Error reading persistent courses CMS:", err);
  }
  return {};
}

export const getPersistentCourseCmsMap = getPersistentCoursesCms;

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
  try {
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
    await writeDataFile("courses-cms.json", all);

    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.course.upsert({
          where: { slug: slugOrId },
          update: {
            title: merged.title || undefined,
            subtitle: merged.subtitle !== undefined ? merged.subtitle : undefined,
            badge: merged.badge !== undefined ? merged.badge : undefined,
            category: merged.category !== undefined ? merged.category : undefined,
            level: merged.level !== undefined ? merged.level : undefined,
            numericPrice: merged.numericPrice !== undefined ? merged.numericPrice : undefined,
            numericOriginalPrice: merged.numericOriginalPrice !== undefined ? merged.numericOriginalPrice : undefined,
            discountPct: merged.discountPct !== undefined ? merged.discountPct : undefined,
            instructorId: merged.instructorId !== undefined ? merged.instructorId : undefined,
            instructorName: merged.instructorName !== undefined ? merged.instructorName : undefined,
            highlights: merged.highlights !== undefined ? (merged.highlights as any) : undefined,
            faqs: merged.faqs !== undefined ? (merged.faqs as any) : undefined,
            curriculum: merged.curriculum !== undefined ? (merged.curriculum as any) : undefined,
          },
          create: {
            slug: slugOrId,
            title: merged.title || slugOrId.replace(/-/g, " "),
            subtitle: merged.subtitle || "",
            badge: merged.badge || "Bestseller",
            category: merged.category || "Video Editing",
            level: merged.level || "Beginner to Advanced",
            numericPrice: merged.numericPrice || 0,
            numericOriginalPrice: merged.numericOriginalPrice || 0,
            discountPct: merged.discountPct || "",
            instructorId: merged.instructorId || "sakil-ahmed",
            instructorName: merged.instructorName || "Sakil Ahmed",
            highlights: (merged.highlights as any) || {},
            faqs: (merged.faqs as any) || [],
            curriculum: (merged.curriculum as any) || [],
          },
        });
      } catch (prismaErr) {
        console.warn("Prisma course CMS upsert warning:", prismaErr);
      }
    }

    return merged;
  } catch (err) {
    console.error("Failed to save course CMS override:", err);
    return updates as CourseCmsOverride;
  }
}

/**
 * Deletes CMS override for a course slug or id permanently
 */
export async function deleteCourseCmsOverride(slugOrId: string): Promise<boolean> {
  if (!slugOrId) return false;
  try {
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
      await writeDataFile("courses-cms.json", all);
    }
    return changed;
  } catch {
    return false;
  }
}
