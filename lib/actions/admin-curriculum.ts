"use server";

import { revalidatePath } from "next/cache";
import { saveCourseCmsOverride } from "@/lib/data/courses-cms";
import { prisma, isPrismaReady } from "@/lib/db/prisma";

export interface LessonItemState {
  id: string;
  title: string;
  duration?: string;
  r2_object_key?: string;
  r2Key?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isPreview?: boolean;
  isFreePreview?: boolean;
  description?: string;
}

export interface ModuleItemState {
  id: string;
  title: string;
  duration?: string;
  lessons: LessonItemState[];
}

/**
 * Updates the course curriculum structure directly in PostgreSQL & persistent CMS overrides
 * Preserves Cloudflare R2 object keys, downloadable attachment URLs, and preview flags
 */
export async function updateCourseCurriculumAction(
  courseId: string,
  curriculumData: ModuleItemState[]
) {
  if (!courseId) {
    return {
      success: false,
      error: "Course ID is required.",
    };
  }

  // Ensure r2_object_key and preview flags are normalized
  const sanitizedCurriculum = curriculumData.map((mod) => ({
    ...mod,
    lessons: (mod.lessons || []).map((les) => {
      const r2Key = les.r2_object_key || les.r2Key || "";
      return {
        id: les.id,
        title: les.title?.trim() || "Untitled Lesson",
        duration: les.duration?.trim() || "10:00",
        r2_object_key: r2Key,
        r2Key: r2Key,
        videoUrl: les.videoUrl?.trim() || "",
        attachmentUrl: les.attachmentUrl?.trim() || "",
        attachmentName: les.attachmentName?.trim() || "",
        isPreview: les.isFreePreview ?? les.isPreview ?? false,
        isFreePreview: les.isFreePreview ?? les.isPreview ?? false,
        description: les.description?.trim() || "",
      };
    }),
  }));

  // 1. Direct update in PostgreSQL via Prisma
  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.course.updateMany({
        where: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
        data: {
          curriculum: sanitizedCurriculum as any,
        },
      });
    } catch (err: any) {
      console.warn("Prisma update curriculum warning:", err.message || err);
    }
  }

  // 2. Persist to disk-backed CMS override as backup
  await saveCourseCmsOverride(courseId, {
    curriculum: sanitizedCurriculum,
  });

  // Cache Invalidation across all dynamic page and layout routes
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/courses/[slug]/curriculum", "page");
  revalidatePath("/admin/courses/[id]", "page");
  revalidatePath("/dashboard/courses/[slug]/learn", "page");
  revalidatePath("/courses", "page");
  revalidatePath("/admin/courses", "page");
  revalidatePath("/admin", "page");
  revalidatePath(`/courses/${courseId}`, "page");
  revalidatePath(`/courses/${courseId}/curriculum`, "page");
  revalidatePath(`/admin/courses/${courseId}`, "page");

  return {
    success: true,
    curriculum: sanitizedCurriculum,
  };
}
