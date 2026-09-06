"use server";

import { revalidatePath } from "next/cache";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getCourseBySlug, CourseModule, CourseLesson } from "@/lib/data/courses";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import {
  getPersistentProgress,
  getAllPersistentProgressForUser,
  markPersistentLessonCompleted,
  togglePersistentLessonCompleted,
} from "@/lib/data/interactions";

export interface CourseProgressResult {
  completedLessonIds: string[];
  completedCount: number;
  totalCount: number;
  percentage: number;
}

/**
 * Helper to resolve total lessons count for a course
 */
async function resolveCourseTotalLessons(courseSlug: string): Promise<number> {
  try {
    const live = await getLiveCourseAction(courseSlug);
    if (live.success && live.course?.curriculum && live.course.curriculum.length > 0) {
      const count = live.course.curriculum.reduce(
        (acc, m) => acc + (m.lessons?.length || 0),
        0
      );
      if (count > 0) return count;
    }
  } catch {}

  try {
    const course = getCourseBySlug(courseSlug);
    const allLessons: CourseLesson[] =
      course.curriculum?.flatMap((m: CourseModule) => m.lessons || []) || [];
    if (allLessons.length > 0) return allLessons.length;
  } catch {}

  return 1;
}

/**
 * Server Action: Get progress for a specific course
 */
export async function getCourseProgressAction(
  courseSlug: string
): Promise<CourseProgressResult> {
  const customer = await getCustomerProfile().catch(() => null);
  const email = customer?.email || "";

  const completedLessonIds = email
    ? await getPersistentProgress(email, courseSlug)
    : [];

  const totalCount = await resolveCourseTotalLessons(courseSlug);
  const completedCount = completedLessonIds.length;
  const percentage =
    totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  return {
    completedLessonIds,
    completedCount,
    totalCount,
    percentage,
  };
}

/**
 * Server Action: Explicitly mark a lesson as completed (Auto-complete when video ends)
 */
export async function markLessonCompletedAction(
  courseSlug: string,
  lessonId: string
): Promise<{
  success: boolean;
  isCompleted: boolean;
  progress: CourseProgressResult;
}> {
  const customer = await getCustomerProfile().catch(() => null);
  const email = customer?.email || "";

  let completedLessonIds: string[] = [];
  if (email) {
    const res = await markPersistentLessonCompleted(email, courseSlug, lessonId);
    completedLessonIds = res.completedLessonIds;
  }

  const totalCount = await resolveCourseTotalLessons(courseSlug);
  const completedCount = completedLessonIds.length;
  const percentage =
    totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  revalidatePath(`/learn/${courseSlug}/${lessonId}`);
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");

  return {
    success: true,
    isCompleted: true,
    progress: {
      completedLessonIds,
      completedCount,
      totalCount,
      percentage,
    },
  };
}

/**
 * Server Action: Toggle lesson completion status
 */
export async function toggleLessonCompletionAction(
  courseSlug: string,
  lessonId: string
): Promise<{
  success: boolean;
  isCompleted: boolean;
  progress: CourseProgressResult;
}> {
  const customer = await getCustomerProfile().catch(() => null);
  const email = customer?.email || "";

  let isCompleted = false;
  let completedLessonIds: string[] = [];

  if (email) {
    const res = await togglePersistentLessonCompleted(email, courseSlug, lessonId);
    isCompleted = res.isCompleted;
    completedLessonIds = res.completedLessonIds;
  }

  const totalCount = await resolveCourseTotalLessons(courseSlug);
  const completedCount = completedLessonIds.length;
  const percentage =
    totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  revalidatePath(`/learn/${courseSlug}/${lessonId}`);
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");

  return {
    success: true,
    isCompleted,
    progress: {
      completedLessonIds,
      completedCount,
      totalCount,
      percentage,
    },
  };
}

/**
 * Server Action: Get all courses progress summary across all dynamic courses
 */
export async function getAllCoursesProgressAction(): Promise<
  Record<string, CourseProgressResult>
> {
  const customer = await getCustomerProfile().catch(() => null);
  const email = customer?.email || "";

  const progressMap = email
    ? await getAllPersistentProgressForUser(email)
    : {};

  const result: Record<string, CourseProgressResult> = {};

  const allSlugs = Object.keys(progressMap);

  for (const slug of allSlugs) {
    const completedLessonIds = progressMap[slug] || [];
    const totalCount = await resolveCourseTotalLessons(slug);
    const completedCount = completedLessonIds.length;
    const percentage =
      totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

    result[slug] = {
      completedLessonIds,
      completedCount,
      totalCount,
      percentage,
    };
  }

  return result;
}
