"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { saveCourseCmsOverride, getCourseCmsOverride, CourseFaqItem } from "@/lib/data/courses-cms";

export interface CoursePayload {
  title: string;
  description?: string;
  subtitle?: string;
  badge?: string;
  category?: string;
  level?: string;
  mainSlogan?: string;
  heroSlogan?: string;
  thumbnail?: string;
  trailerUrl?: string;
  instructor?: string;
  instructorId?: string;
  priceBdt?: number;
  originalPriceBdt?: number;
  discountPct?: string;
  whatYouWillLearn?: string[] | string;
  requirements?: string[] | string;
  includes?: string[] | string;
  highlights?: {
    hours?: string;
    lessons?: string;
    access?: string;
    certificate?: string;
  };
  faqs?: CourseFaqItem[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const adminToken =
    cookieStore.get("sakil_admin_token")?.value ||
    cookieStore.get("medusa_admin_token")?.value ||
    "";

  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  const apiKey =
    process.env.MEDUSA_API_KEY || "sakil_headless_lms_admin_key";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey,
    "x-medusa-access-token": apiKey,
  };

  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
    headers["Cookie"] = `sakil_admin_token=${adminToken}`;
  }

  return headers;
}

/**
 * Enterprise Headless Course Creation Action
 */
export async function createAdminCourseAction(payload: CoursePayload) {
  const {
    title,
    description = "",
    thumbnail = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    trailerUrl = "https://youtube.com/watch?v=demo",
    instructor = "Sakil Ahmed",
    priceBdt = 1299,
  } = payload;

  if (!title?.trim()) {
    return {
      success: false,
      error: "Course Title is required.",
    };
  }

  const slug = slugify(title) || `course-${Date.now()}`;
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const headers = await getAuthHeaders();

  const bodyData = {
    title: title.trim(),
    description: description.trim(),
    thumbnail: thumbnail.trim(),
    trailerUrl: trailerUrl.trim(),
    priceBdt: Number(priceBdt) || 1299,
    instructor: instructor.trim(),
    metadata: {
      thumbnail: thumbnail.trim(),
      image: thumbnail.trim(),
      trailer_url: trailerUrl.trim(),
      trailerUrl: trailerUrl.trim(),
      instructor: instructor.trim(),
      instructorId: payload.instructorId,
      subtitle: payload.subtitle,
      badge: payload.badge,
      category: payload.category,
      level: payload.level,
      mainSlogan: payload.mainSlogan,
      heroSlogan: payload.heroSlogan,
      numericPrice: Number(priceBdt) || 1299,
      numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : undefined,
      discountPct: payload.discountPct,
      highlights: payload.highlights,
      faqs: payload.faqs,
      whatYouWillLearn: payload.whatYouWillLearn,
      requirements: payload.requirements,
      includes: payload.includes,
    },
  };

  // 1. Always persist CMS override immediately to prevent data loss
  await saveCourseCmsOverride(slug, {
    subtitle: payload.subtitle,
    badge: payload.badge,
    category: payload.category,
    level: payload.level,
    mainSlogan: payload.mainSlogan,
    heroSlogan: payload.heroSlogan,
    numericPrice: Number(priceBdt) || 1299,
    numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : undefined,
    discountPct: payload.discountPct,
    instructorId: payload.instructorId,
    instructorName: instructor.trim(),
    highlights: payload.highlights,
    faqs: payload.faqs,
  });

  try {
    let response = await fetch(`${backendUrl}/lms/courses/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyData),
      cache: "no-store",
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${backendUrl}/admin/courses/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyData),
        cache: "no-store",
      });
    }

    const data = await response.json().catch(() => null);

    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");
    revalidatePath("/");

    return {
      success: true,
      product: data?.product || { id: slug, handle: slug, title: title.trim() },
      slug,
    };
  } catch (err: any) {
    console.warn("MEDUSA CREATE OFFLINE (persisted to CMS override):", err.message || err);
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");
    revalidatePath("/");

    return {
      success: true,
      product: { id: slug, handle: slug, title: title.trim() },
      slug,
    };
  }
}

/**
 * Fetch a single course by ID or Handle for editing
 */
export async function getAdminCourseByIdAction(id: string) {
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const headers = await getAuthHeaders();
  const cmsOverride = await getCourseCmsOverride(id);

  try {
    const response = await fetch(`${backendUrl}/lms/courses/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.product) {
        // Merge with CMS overrides if present
        if (cmsOverride) {
          data.product.metadata = {
            ...(data.product.metadata || {}),
            ...cmsOverride,
            faqs: cmsOverride.faqs || data.product.metadata?.faqs,
          };
        }
        return {
          success: true,
          product: data.product,
        };
      }
    }
  } catch (err: any) {
    console.error("GET COURSE BY ID ERROR:", err.message || err);
  }

  // Fallback: If Medusa is offline or course is seeded in CMS overrides
  if (cmsOverride) {
    return {
      success: true,
      product: {
        id,
        handle: id,
        title: id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        description: cmsOverride.subtitle || "",
        thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
        variants: [
          {
            prices: [{ amount: cmsOverride.numericPrice || 1299, currency_code: "bdt" }],
          },
        ],
        metadata: {
          ...cmsOverride,
          instructor: cmsOverride.instructorName || "Sakil Ahmed",
          faqs: cmsOverride.faqs || [],
        },
      },
    };
  }

  return {
    success: false,
    error: "Course not found.",
  };
}

/**
 * Update an existing course
 */
export async function updateAdminCourseAction(
  id: string,
  payload: Partial<CoursePayload>
) {
  if (!id) {
    return { success: false, error: "Course ID is required." };
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const headers = await getAuthHeaders();

  const formattedThumbnail = payload.thumbnail?.trim() || "";
  const formattedTrailer = payload.trailerUrl?.trim() || "";
  const formattedInstructor = payload.instructor?.trim() || "";

  const bodyData = {
    ...payload,
    title: payload.title?.trim(),
    description: payload.description?.trim(),
    thumbnail: formattedThumbnail,
    image: formattedThumbnail,
    images: formattedThumbnail ? [{ url: formattedThumbnail }] : undefined,
    trailerUrl: formattedTrailer,
    instructor: formattedInstructor,
    priceBdt: payload.priceBdt ? Number(payload.priceBdt) : undefined,
    metadata: {
      thumbnail: formattedThumbnail,
      image: formattedThumbnail,
      trailer_url: formattedTrailer,
      trailerUrl: formattedTrailer,
      instructor: formattedInstructor,
      instructorId: payload.instructorId,
      subtitle: payload.subtitle,
      badge: payload.badge,
      category: payload.category,
      level: payload.level,
      mainSlogan: payload.mainSlogan,
      heroSlogan: payload.heroSlogan,
      numericPrice: payload.priceBdt ? Number(payload.priceBdt) : undefined,
      numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : undefined,
      discountPct: payload.discountPct,
      whatYouWillLearn: payload.whatYouWillLearn,
      requirements: payload.requirements,
      includes: payload.includes,
      highlights: payload.highlights,
      faqs: payload.faqs,
    },
  };

  // Always save to persistent courses CMS override
  await saveCourseCmsOverride(id, {
    subtitle: payload.subtitle,
    badge: payload.badge,
    category: payload.category,
    level: payload.level,
    mainSlogan: payload.mainSlogan,
    heroSlogan: payload.heroSlogan,
    numericPrice: payload.priceBdt ? Number(payload.priceBdt) : undefined,
    numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : undefined,
    discountPct: payload.discountPct,
    instructorId: payload.instructorId,
    instructorName: payload.instructor,
    highlights: payload.highlights,
    faqs: payload.faqs,
  });

  try {
    let response = await fetch(`${backendUrl}/lms/courses/${id}`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyData),
      cache: "no-store",
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${backendUrl}/admin/courses/${id}`, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyData),
        cache: "no-store",
      });
    }

    const data = await response.json().catch(() => null);

    const courseHandle = data?.product?.handle || id;

    // Save under handle as well if different from id
    if (courseHandle && courseHandle !== id) {
      await saveCourseCmsOverride(courseHandle, {
        subtitle: payload.subtitle,
        badge: payload.badge,
        category: payload.category,
        level: payload.level,
        mainSlogan: payload.mainSlogan,
        heroSlogan: payload.heroSlogan,
        numericPrice: payload.priceBdt ? Number(payload.priceBdt) : undefined,
        numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : undefined,
        discountPct: payload.discountPct,
        instructorId: payload.instructorId,
        instructorName: payload.instructor,
        highlights: payload.highlights,
        faqs: payload.faqs,
      });
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath(`/admin/courses/${courseHandle}`);
    revalidatePath("/admin");
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseHandle}`);
    revalidatePath(`/courses/${courseHandle}/curriculum`);
    revalidatePath(`/courses/${courseHandle}/instructor`);
    revalidatePath(`/courses/${courseHandle}/reviews`);
    revalidatePath(`/checkout/${courseHandle}`);
    revalidatePath(`/learn/${courseHandle}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/");

    return {
      success: true,
      product: data?.product || { id, handle: courseHandle, title: payload.title },
    };
  } catch (err: any) {
    console.warn("MEDUSA UPDATE OFFLINE (falling back to CMS override):", err.message);
    return {
      success: true,
      product: { id, handle: id, title: payload.title },
    };
  }
}

/**
 * Hard Delete a masterclass permanently from Medusa database, storefront catalog, and student dashboards
 */
export async function deleteAdminCourseAction(idOrSlug: string): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  if (!idOrSlug) {
    return { success: false, error: "Course ID or Slug is required." };
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const headers = await getAuthHeaders();

  try {
    // 1. Delete from Medusa backend /lms/courses/:id
    let response = await fetch(`${backendUrl}/lms/courses/${idOrSlug}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    if (!response.ok && response.status === 404) {
      response = await fetch(`${backendUrl}/admin/products/${idOrSlug}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      });
    }

    if (!response.ok && response.status === 404) {
      response = await fetch(`${backendUrl}/admin/courses/${idOrSlug}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      });
    }

    // 2. Scrub course slug from persistent student customer records
    try {
      const { getPersistentCustomers, savePersistentCustomer } = await import("@/lib/data/customers");
      const customers = await getPersistentCustomers();
      const normalizedTarget = idOrSlug.toLowerCase().trim();

      for (const cust of customers) {
        let changed = false;
        if (cust.customEnrolledSlugs && cust.customEnrolledSlugs.some(s => s.toLowerCase() === normalizedTarget)) {
          cust.customEnrolledSlugs = cust.customEnrolledSlugs.filter(s => s.toLowerCase() !== normalizedTarget);
          changed = true;
        }
        if (!cust.revokedSlugs) cust.revokedSlugs = [];
        if (!cust.revokedSlugs.includes(normalizedTarget)) {
          cust.revokedSlugs.push(normalizedTarget);
          changed = true;
        }
        if (changed) {
          await savePersistentCustomer(cust);
        }
      }
    } catch (scrubErr) {
      console.error("FAILED TO SCRUB DELETED COURSE FROM CUSTOMERS:", scrubErr);
    }

    // 3. Scrub course key permanently from persistent courses CMS override
    try {
      const { deleteCourseCmsOverride } = await import("@/lib/data/courses-cms");
      await deleteCourseCmsOverride(idOrSlug);
    } catch (cmsErr) {
      console.error("FAILED TO SCRUB DELETED COURSE FROM CMS:", cmsErr);
    }

    // 4. Deep multi-route cache revalidation
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/admin/students");
    revalidatePath(`/admin/courses/${idOrSlug}`);
    revalidatePath("/courses");
    revalidatePath(`/courses/${idOrSlug}`);
    revalidatePath(`/courses/${idOrSlug}/curriculum`);
    revalidatePath(`/courses/${idOrSlug}/instructor`);
    revalidatePath(`/courses/${idOrSlug}/reviews`);
    revalidatePath(`/checkout/${idOrSlug}`);
    revalidatePath(`/learn/${idOrSlug}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/");

    return {
      success: true,
      id: idOrSlug,
    };
  } catch (err: any) {
    console.error("DELETE ACTION ERROR:", err.message || err);
    return {
      success: false,
      error: err.message || "Failed to delete masterclass.",
    };
  }
}

/**
 * Server Action: Alias for deleteAdminCourseAction (deleteMasterclassAction)
 */
export const deleteMasterclassAction = deleteAdminCourseAction;
