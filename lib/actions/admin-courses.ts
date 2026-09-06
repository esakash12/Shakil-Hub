"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

import { saveCourseCmsOverride, getCourseCmsOverride, CourseFaqItem } from "@/lib/data/courses-cms";
import { prisma, isPrismaReady } from "@/lib/db/prisma";

async function persistBase64Image(dataUri?: string): Promise<string> {
  if (!dataUri || !dataUri.startsWith("data:")) return dataUri || "";
  try {
    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1].split("/")[1]?.replace("+xml", "") || "png";
      const buffer = Buffer.from(matches[2], "base64");
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const targets = [
        path.join(process.cwd(), "public", "uploads", "thumbnails", filename),
        path.join(process.cwd(), ".next", "standalone", "public", "uploads", "thumbnails", filename),
      ];
      for (const t of targets) {
        try {
          await fs.mkdir(path.dirname(t), { recursive: true });
          await fs.writeFile(t, buffer);
        } catch {}
      }
      return `/uploads/thumbnails/${filename}`;
    }
  } catch (err) {
    console.error("Failed to decode base64 thumbnail:", err);
  }
  return "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80";
}

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

  if (adminToken && (adminToken.startsWith("eyJ") || adminToken.startsWith("adm_jwt_"))) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  return headers;
}

/**
 * Enterprise Headless Course Creation Action
 */
export async function createAdminCourseAction(payload: CoursePayload) {
  try {
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

    const cleanThumbnail = await persistBase64Image(thumbnail?.trim() || "");
    const safeThumbnail =
      cleanThumbnail ||
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80";

    const slug = slugify(title) || `course-${Date.now()}`;
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const headers = await getAuthHeaders();

    const bodyData = {
      title: title.trim(),
      description: description.trim(),
      thumbnail: safeThumbnail,
      trailerUrl: trailerUrl.trim(),
      priceBdt: Number(priceBdt) || 1299,
      instructor: instructor.trim(),
      metadata: {
        thumbnail: safeThumbnail,
        image: safeThumbnail,
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

    // 1. Always persist CMS override immediately (failsafe)
    try {
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
    } catch (cmsErr: any) {
      console.warn("CMS OVERRIDE WRITE WARNING:", cmsErr.message);
    }

    // 2. Persist in PostgreSQL via Prisma
    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.course.upsert({
          where: { slug },
          update: {
            title: title.trim(),
            subtitle: payload.subtitle || "",
            badge: payload.badge || "Bestseller",
            category: payload.category || "Video Editing",
            level: payload.level || "Beginner to Advanced",
            numericPrice: Number(priceBdt) || 1299,
            numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : 2858,
            discountPct: payload.discountPct || "",
            image: safeThumbnail,
            thumbnail: safeThumbnail,
            trailerImage: safeThumbnail,
            trailerVideo: trailerUrl.trim(),
            instructorId: payload.instructorId || "sakil-ahmed",
            instructorName: instructor.trim(),
            highlights: (payload.highlights as any) || {},
            faqs: (payload.faqs as any) || [],
          },
          create: {
            slug,
            title: title.trim(),
            subtitle: payload.subtitle || "",
            badge: payload.badge || "Bestseller",
            category: payload.category || "Video Editing",
            level: payload.level || "Beginner to Advanced",
            numericPrice: Number(priceBdt) || 1299,
            numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : 2858,
            discountPct: payload.discountPct || "",
            image: safeThumbnail,
            thumbnail: safeThumbnail,
            trailerImage: safeThumbnail,
            trailerVideo: trailerUrl.trim(),
            instructorId: payload.instructorId || "sakil-ahmed",
            instructorName: instructor.trim(),
            highlights: (payload.highlights as any) || {},
            faqs: (payload.faqs as any) || [],
            curriculum: [],
            status: "published",
          },
        });
      } catch (prismaErr: any) {
        console.warn("Prisma course create warning:", prismaErr.message || prismaErr);
      }
    }

    let productData: any = null;

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

      const resData = await response.json().catch(() => null);

      if (response.ok && (resData?.success !== false || resData?.product)) {
        productData = resData?.product;
      }
    } catch (medusaErr: any) {
      console.warn("Medusa sync skipped (PostgreSQL is active):", medusaErr.message);
    }

    // If Medusa is offline, use the PostgreSQL / CMS record
    productData = productData || {
      id: slug,
      handle: slug,
      title: title.trim(),
      thumbnail: safeThumbnail,
    };

    try {
      revalidatePath("/admin/courses");
      revalidatePath("/admin");
      revalidatePath("/courses");
      revalidatePath("/");
    } catch {}

    return {
      success: true,
      product: productData,
      slug: productData.handle || slug,
    };
  } catch (err: any) {
    console.error("CREATE ADMIN COURSE ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to create course. Please verify details and try again.",
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
  try {
    if (!id) {
      return { success: false, error: "Course ID is required." };
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const headers = await getAuthHeaders();

    const formattedThumbnail = await persistBase64Image(payload.thumbnail?.trim() || "");
    const formattedTrailer = payload.trailerUrl?.trim() || "";
    const formattedInstructor = payload.instructor?.trim() || "";

    const bodyData = {
      ...payload,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      thumbnail: formattedThumbnail,
      image: formattedThumbnail,
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

    // Always save to persistent courses CMS override (safe)
    try {
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
    } catch (cmsErr: any) {
      console.warn("CMS OVERRIDE UPDATE WARNING:", cmsErr.message);
    }

    let productData: any = null;
    let courseHandle = id;

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

      if (response.ok) {
        const data = await response.json().catch(() => null);
        productData = data?.product;
        if (data?.product?.handle) {
          courseHandle = data.product.handle;
        }
      }
    } catch (medusaErr: any) {
      console.warn("MEDUSA UPDATE OFFLINE (falling back to CMS override):", medusaErr.message || medusaErr);
    }

    // Save under handle as well if different from id
    if (courseHandle && courseHandle !== id) {
      try {
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
      } catch {}
    }

    // Update directly in PostgreSQL via Prisma
    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.course.updateMany({
          where: {
            OR: [{ id }, { slug: id }, { slug: courseHandle }],
          },
          data: {
            title: payload.title?.trim(),
            subtitle: payload.subtitle,
            badge: payload.badge,
            category: payload.category,
            level: payload.level,
            numericPrice: payload.priceBdt ? Number(payload.priceBdt) : undefined,
            numericOriginalPrice: payload.originalPriceBdt ? Number(payload.originalPriceBdt) : undefined,
            discountPct: payload.discountPct,
            image: formattedThumbnail || undefined,
            thumbnail: formattedThumbnail || undefined,
            trailerVideo: formattedTrailer || undefined,
            instructorId: payload.instructorId,
            instructorName: formattedInstructor,
            highlights: (payload.highlights as any) || undefined,
            faqs: (payload.faqs as any) || undefined,
          },
        });
      } catch (dbErr: any) {
        console.warn("Prisma update course warning:", dbErr.message || dbErr);
      }
    }

    try {
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
    } catch {}

    return {
      success: true,
      product: productData || { id, handle: courseHandle, title: payload.title },
    };
  } catch (err: any) {
    console.error("UPDATE ADMIN COURSE ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to update course.",
    };
  }
}

/**
 * Hard Delete a masterclass permanently from PostgreSQL database, storefront catalog, and student dashboards
 */
export async function deleteAdminCourseAction(idOrSlug: string): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  if (!idOrSlug) {
    return { success: false, error: "Course ID or Slug is required." };
  }

  try {
    // 1. Delete directly from PostgreSQL via Prisma (Primary single DB)
    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.course.deleteMany({
          where: {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
          },
        });
      } catch (dbErr: any) {
        console.warn("Prisma delete course warning:", dbErr.message || dbErr);
      }
    }

    // 2. Delete from Medusa backend safely (no crash if Medusa is offline)
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const headers = await getAuthHeaders();
      await fetch(`${backendUrl}/lms/courses/${idOrSlug}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      }).catch(() => null);

      await fetch(`${backendUrl}/admin/courses/${idOrSlug}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      }).catch(() => null);
    } catch {}

    // 3. Scrub course slug from persistent student customer records
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
