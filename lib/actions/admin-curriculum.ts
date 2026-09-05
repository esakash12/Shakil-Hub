"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { saveCourseCmsOverride } from "@/lib/data/courses-cms";

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
 * Updates the course curriculum structure inside Medusa metadata & persistent CMS overrides
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

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  const apiKey =
    process.env.MEDUSA_API_KEY || "sakil_headless_lms_admin_key";

  const cookieStore = await cookies();
  const adminToken =
    cookieStore.get("sakil_admin_token")?.value ||
    cookieStore.get("medusa_admin_token")?.value ||
    "";

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey,
    "x-medusa-access-token": apiKey,
  };

  if (adminToken) {
    requestHeaders["Authorization"] = `Bearer ${adminToken}`;
    requestHeaders["Cookie"] = `sakil_admin_token=${adminToken}`;
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

  // 1. Always persist to disk-backed CMS override
  await saveCourseCmsOverride(courseId, {
    curriculum: sanitizedCurriculum,
  });

  try {
    const response = await fetch(`${backendUrl}/lms/courses/${courseId}`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        curriculum: sanitizedCurriculum,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    const productHandle = data?.product?.handle;
    if (productHandle && productHandle !== courseId) {
      await saveCourseCmsOverride(productHandle, {
        curriculum: sanitizedCurriculum,
      });
      revalidatePath(`/courses/${productHandle}`, "page");
      revalidatePath(`/courses/${productHandle}/curriculum`, "page");
      revalidatePath(`/dashboard/courses/${productHandle}/learn`, "page");
    }

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
      product: data?.product,
      curriculum: sanitizedCurriculum,
    };
  } catch (err: any) {
    console.warn("MEDUSA CURRICULUM OFFLINE (persisted to CMS override):", err.message || err);

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
}
