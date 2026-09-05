"use server";

import { revalidatePath } from "next/cache";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getLiveCourseBySlug, getCourseBySlug, CourseDetail } from "@/lib/data/courses";
import {
  getPersistentWishlist,
  togglePersistentWishlist,
} from "@/lib/data/interactions";

/**
 * Server Action: Get all wishlisted courses for the current student
 */
export async function getWishlistCoursesAction(): Promise<CourseDetail[]> {
  try {
    const customer = await getCustomerProfile().catch(() => null);
    const email = customer?.email || "";

    const slugs: string[] = email ? await getPersistentWishlist(email) : [];

    if (slugs.length === 0) {
      return [];
    }

    const coursePromises = slugs.map(async (slug) => {
      try {
        const live = await getLiveCourseBySlug(slug);
        if (live) return live;
      } catch {}
      return getCourseBySlug(slug);
    });

    const courses = await Promise.all(coursePromises);
    return courses.filter(Boolean);
  } catch (err) {
    console.error("GET WISHLIST ERROR:", err);
    return [];
  }
}

/**
 * Server Action: Toggle course in wishlist
 */
export async function toggleWishlistCourseAction(
  courseSlug: string
): Promise<{ success: boolean; isWishlisted: boolean; slugs: string[] }> {
  try {
    const customer = await getCustomerProfile().catch(() => null);
    const email = customer?.email || "";

    let isWishlisted = false;
    let slugs: string[] = [];

    if (email) {
      const res = await togglePersistentWishlist(email, courseSlug);
      isWishlisted = res.isWishlisted;
      slugs = res.slugs;
    }

    revalidatePath("/dashboard/wishlist");
    revalidatePath(`/courses/${courseSlug}`);

    return {
      success: true,
      isWishlisted,
      slugs,
    };
  } catch {
    return {
      success: false,
      isWishlisted: false,
      slugs: [],
    };
  }
}
