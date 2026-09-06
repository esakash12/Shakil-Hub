"use server";

import { mapMedusaProductToCourse, CourseDetail, getCourseBySlug } from "@/lib/data/courses";
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
      subtitle: override.subtitle || course.subtitle,
      badge: override.badge || course.badge,
      category: override.category || course.category,
      level: override.level || course.level,
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
 * Server Action: Fetches a single masterclass by handle or ID directly from the backend.
 * Runs 100% on the Next.js Node.js server to completely eliminate browser CORS and network errors.
 */
export async function getLiveCourseAction(slug: string): Promise<{
  success: boolean;
  course: CourseDetail | null;
  error?: string;
}> {
  if (!slug) {
    return { success: false, course: null, error: "Slug is required" };
  }

  const backendUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000";
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  try {
    // 1. Direct LMS Course lookup by handle or ID
    try {
      const lmsRes = await fetch(`${backendUrl}/lms/courses/${slug}`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (lmsRes.ok) {
        const lmsData = await lmsRes.json().catch(() => null);
        if (lmsData?.product) {
          const course = mapMedusaProductToCourse(lmsData.product);
          return {
            success: true,
            course: await applyCmsOverrides(course, slug),
          };
        }
      }
    } catch (e) {
      // Continue to next strategy
    }

    // 2. Query Storefront API
    try {
      const res = await fetch(
        `${backendUrl}/store/products?handle=${slug}&fields=*metadata`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey,
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.products?.[0]) {
          const course = mapMedusaProductToCourse(data.products[0]);
          return {
            success: true,
            course: await applyCmsOverrides(course, slug),
          };
        }
      }
    } catch (e) {
      // Continue to next strategy
    }

    // 3. Fallback scan all courses in LMS
    try {
      const allCoursesRes = await fetch(`${backendUrl}/lms/courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (allCoursesRes.ok) {
        const allData = await allCoursesRes.json().catch(() => null);
        if (allData?.courses && Array.isArray(allData.courses)) {
          const found = allData.courses.find(
            (c: any) =>
              c.handle === slug ||
              c.id === slug ||
              c.title
                ?.toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .trim()
                .replace(/[\s_-]+/g, "-") === slug
          );
          if (found) {
            const course = mapMedusaProductToCourse(found);
            return {
              success: true,
              course: await applyCmsOverrides(course, slug),
            };
          }
        }
      }
    } catch (e) {
      // Backend unreachable
    }

    // Strict 404: Course does not exist
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
 * Server Action: Fetches all published masterclasses for the storefront catalog.
 */
export async function getLiveStorefrontCoursesAction(): Promise<{
  success: boolean;
  courses: CourseDetail[];
}> {
  const backendUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000";
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  try {
    // 1. Query Direct LMS Catalog API
    try {
      const lmsRes = await fetch(`${backendUrl}/lms/courses`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (lmsRes.ok) {
        const lmsData = await lmsRes.json().catch(() => null);
        if (lmsData?.courses && Array.isArray(lmsData.courses) && lmsData.courses.length > 0) {
          const mapped = lmsData.courses.map(mapMedusaProductToCourse);
          const enriched = await Promise.all(
            mapped.map((c: CourseDetail) => applyCmsOverrides(c, c.slug))
          );
          return {
            success: true,
            courses: enriched,
          };
        }
      }
    } catch (e) {
      // Continue
    }

    // 2. Query Medusa Store API
    try {
      const res = await fetch(
        `${backendUrl}/store/products?limit=50&fields=*metadata`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey,
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products.map(mapMedusaProductToCourse);
          const enriched = await Promise.all(
            mapped.map((c: CourseDetail) => applyCmsOverrides(c, c.slug))
          );
          return {
            success: true,
            courses: enriched,
          };
        }
      }
    } catch (e) {
      // Continue
    }
  } catch (err: any) {
    console.error("SERVER ACTION getLiveStorefrontCoursesAction ERROR:", err);
  }

  return {
    success: true,
    courses: [],
  };
}
