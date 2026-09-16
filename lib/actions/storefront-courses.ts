"use server";

import { CourseDetail } from "@/lib/data/courses";
import { getLiveCourseBySlug, getLiveStorefrontCourses } from "@/lib/data/courses-db";
import { getCourseCmsOverride } from "@/lib/data/courses-cms";
import { getInstructorById, getPersistentInstructors } from "@/lib/data/instructors";

/**
 * Merges course data with persistent CMS overrides and live assigned instructor
 */
async function applyCmsOverrides(course: CourseDetail, slug: string): Promise<CourseDetail> {
  try {
    const override = await getCourseCmsOverride(slug);

    // Dynamic instructor resolution
    let instructorObj = { ...course.instructor };
    const targetInstructorId = override?.instructorId || course.instructorId || "";
    const targetInstructorName = override?.instructorName || course.instructor?.name || "";

    let liveInst = targetInstructorId ? await getInstructorById(targetInstructorId) : null;
    if (!liveInst && targetInstructorName) {
      liveInst = await getInstructorById(targetInstructorName);
    }
    if (!liveInst) {
      const allInstructors = await getPersistentInstructors();
      if (allInstructors.length > 0) {
        liveInst = allInstructors[0];
      }
    }

    if (liveInst) {
      instructorObj = {
        name: liveInst.name || instructorObj.name,
        role: liveInst.role || instructorObj.role,
        avatar: liveInst.avatar || instructorObj.avatar,
        bio: liveInst.bio || instructorObj.bio,
        experience: liveInst.experience || instructorObj.experience,
        projects: liveInst.projects || instructorObj.projects,
        students: liveInst.students || instructorObj.students,
        socials: liveInst.socials || {},
      };
    }

    if (!override) {
      return {
        ...course,
        instructor: instructorObj,
      };
    }

    return {
      ...course,
      title: override.title || course.title,
      subtitle: override.subtitle || course.subtitle,
      badge: override.badge || course.badge,
      category: override.category || course.category,
      level: override.level || course.level,
      image: override.image || course.image,
      thumbnail: override.thumbnail || course.thumbnail,
      trailerImage: override.trailerImage || course.trailerImage,
      trailerVideo: override.trailerVideo !== undefined ? override.trailerVideo : course.trailerVideo,
      mainSlogan: override.mainSlogan || course.mainSlogan,
      heroSlogan: override.heroSlogan || course.heroSlogan,
      numericPrice: override.numericPrice ?? course.numericPrice,
      price: override.numericPrice ? `৳${override.numericPrice.toLocaleString()}` : course.price,
      numericOriginalPrice: override.numericOriginalPrice ?? course.numericOriginalPrice,
      originalPrice: override.numericOriginalPrice
        ? `৳${override.numericOriginalPrice.toLocaleString()}`
        : course.originalPrice,
      discountPct: override.discountPct || course.discountPct,
      instructorId: override.instructorId || course.instructorId,
      instructor: instructorObj,
      highlights: {
        ...course.highlights,
        ...(override.highlights || {}),
      },
      faqs: override.faqs && override.faqs.length > 0 ? override.faqs : course.faqs,
      curriculum: override.curriculum && override.curriculum.length > 0 ? override.curriculum : course.curriculum,
    };
  } catch {
    return course;
  }
}

/**
 * Server Action: Fetches a single masterclass by handle or ID directly from PostgreSQL database.
 */
export async function getLiveCourseAction(slug: string): Promise<{
  success: boolean;
  course: CourseDetail | null;
  error?: string;
}> {
  if (!slug) {
    return { success: false, course: null, error: "Slug is required" };
  }

  try {
    const rawCourse = await getLiveCourseBySlug(slug);
    if (rawCourse) {
      const course = await applyCmsOverrides(rawCourse, slug);
      return {
        success: true,
        course,
      };
    }

    return {
      success: false,
      course: null,
      error: "Course not found",
    };
  } catch (err: any) {
    console.error("SERVER ACTION getLiveCourseAction ERROR:", err.message || err);
    return {
      success: false,
      course: null,
      error: err.message || "Failed to fetch live course",
    };
  }
}

/**
 * Server Action: Fetches all published masterclasses directly from PostgreSQL database.
 */
export async function getLiveStorefrontCoursesAction(): Promise<{
  success: boolean;
  courses: CourseDetail[];
}> {
  try {
    const dbCourses = await getLiveStorefrontCourses();
    const enriched = await Promise.all(
      dbCourses.map((c: CourseDetail) => applyCmsOverrides(c, c.slug))
    );
    return {
      success: true,
      courses: enriched,
    };
  } catch (err: any) {
    console.error("SERVER ACTION getLiveStorefrontCoursesAction ERROR:", err);
    return {
      success: true,
      courses: [],
    };
  }
}
