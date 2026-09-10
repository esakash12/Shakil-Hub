"use server";

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

/**
 * Enterprise Course Creation Action (Direct PostgreSQL via Prisma)
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
    const numPrice = Number(priceBdt) || 1299;
    const origPrice = payload.originalPriceBdt ? Number(payload.originalPriceBdt) : 2858;

    const parseList = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === "string") return val.split("\n").map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const structuredHighlights = {
      hours: payload.highlights?.hours || "20+ Hours",
      access: payload.highlights?.access || "Lifetime Access",
      certificate: payload.highlights?.certificate || "Certificate Included",
      description: payload.description ? payload.description.trim() : (payload.subtitle?.trim() || ""),
      whatYouWillLearn: parseList(payload.whatYouWillLearn),
      requirements: parseList(payload.requirements),
      includes: parseList(payload.includes),
    };

    // 1. Persist directly in PostgreSQL via Prisma
    if (prisma && (await isPrismaReady())) {
      try {
        await prisma.course.upsert({
          where: { slug },
          update: {
            title: title.trim(),
            subtitle: payload.subtitle || description.trim() || "",
            badge: payload.badge || "Bestseller",
            category: payload.category || "Video Editing",
            level: payload.level || "Beginner to Advanced",
            price: `৳${numPrice.toLocaleString()}`,
            originalPrice: `৳${origPrice.toLocaleString()}`,
            numericPrice: numPrice,
            numericOriginalPrice: origPrice,
            discountPct: payload.discountPct || "45% OFF",
            image: safeThumbnail,
            thumbnail: safeThumbnail,
            trailerImage: safeThumbnail,
            trailerVideo: trailerUrl.trim(),
            instructorId: payload.instructorId || "sakil-ahmed",
            instructorName: instructor.trim(),
            highlights: structuredHighlights,
            faqs: (payload.faqs as any) || [],
            status: "published",
          },
          create: {
            slug,
            title: title.trim(),
            subtitle: payload.subtitle || description.trim() || "",
            badge: payload.badge || "Bestseller",
            category: payload.category || "Video Editing",
            level: payload.level || "Beginner to Advanced",
            price: `৳${numPrice.toLocaleString()}`,
            originalPrice: `৳${origPrice.toLocaleString()}`,
            numericPrice: numPrice,
            numericOriginalPrice: origPrice,
            discountPct: payload.discountPct || "45% OFF",
            image: safeThumbnail,
            thumbnail: safeThumbnail,
            trailerImage: safeThumbnail,
            trailerVideo: trailerUrl.trim(),
            instructorId: payload.instructorId || "sakil-ahmed",
            instructorName: instructor.trim(),
            highlights: structuredHighlights,
            faqs: (payload.faqs as any) || [],
            curriculum: [],
            status: "published",
          },
        });
      } catch (prismaErr: any) {
        console.warn("Prisma course create warning:", prismaErr.message || prismaErr);
      }
    }

    // 2. Persist CMS override as failsafe backup
    try {
      await saveCourseCmsOverride(slug, {
        subtitle: payload.subtitle || description.trim() || "",
        badge: payload.badge,
        category: payload.category,
        level: payload.level,
        mainSlogan: payload.mainSlogan,
        heroSlogan: payload.heroSlogan,
        numericPrice: numPrice,
        numericOriginalPrice: origPrice,
        discountPct: payload.discountPct,
        instructorId: payload.instructorId,
        instructorName: instructor.trim(),
        highlights: payload.highlights,
        faqs: payload.faqs,
      });
    } catch (cmsErr: any) {
      console.warn("CMS OVERRIDE WRITE WARNING:", cmsErr.message);
    }

    const productData = {
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
      slug,
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
  if (!id) return { success: false, error: "Course ID is required." };
  const cleanId = id.trim();

  // 1. Direct PostgreSQL query via Prisma
  if (prisma && (await isPrismaReady())) {
    try {
      const c = await prisma.course.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { slug: cleanId },
            { slug: { equals: cleanId, mode: "insensitive" } },
          ],
        },
      });

      if (c) {
        const cmsOverride = await getCourseCmsOverride(c.slug);
        const h: any = (typeof c.highlights === "string" ? JSON.parse(c.highlights) : c.highlights) || {};
        const fullDesc = h.description || c.subtitle || "";
        const wLearn = (h.whatYouWillLearn && h.whatYouWillLearn.length > 0) ? h.whatYouWillLearn : ((cmsOverride as any)?.whatYouWillLearn || []);
        const reqs = (h.requirements && h.requirements.length > 0) ? h.requirements : ((cmsOverride as any)?.requirements || []);
        const incs = (h.includes && h.includes.length > 0) ? h.includes : ((cmsOverride as any)?.includes || []);

        return {
          success: true,
          product: {
            id: c.id,
            handle: c.slug,
            title: c.title,
            description: fullDesc,
            thumbnail: c.thumbnail || c.image,
            variants: [
              {
                prices: [{ amount: c.numericPrice, currency_code: "bdt" }],
              },
            ],
            metadata: {
              ...(cmsOverride || {}),
              subtitle: c.subtitle,
              badge: c.badge,
              category: c.category,
              level: c.level,
              numericPrice: c.numericPrice,
              numericOriginalPrice: c.numericOriginalPrice,
              discountPct: c.discountPct,
              instructor: c.instructorName || "Sakil Ahmed",
              instructorId: c.instructorId,
              trailerUrl: c.trailerVideo,
              highlights: h,
              description: fullDesc,
              whatYouWillLearn: wLearn,
              requirements: reqs,
              includes: incs,
              faqs: (c.faqs as any) || [],
              curriculum: (c.curriculum as any) || [],
            },
          },
        };
      }
    } catch (err: any) {
      console.error("Prisma getAdminCourseByIdAction error:", err.message || err);
    }
  }

  // 2. Fallback: Check CMS override
  const cmsOverride = await getCourseCmsOverride(cleanId);
  if (cmsOverride) {
    return {
      success: true,
      product: {
        id: cleanId,
        handle: cleanId,
        title: cleanId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
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
 * Update an existing course (Direct PostgreSQL via Prisma)
 */
export async function updateAdminCourseAction(
  id: string,
  payload: Partial<CoursePayload>
) {
  try {
    if (!id) {
      return { success: false, error: "Course ID is required." };
    }

    const formattedThumbnail = await persistBase64Image(payload.thumbnail?.trim() || "");
    const formattedTrailer = payload.trailerUrl?.trim() || "";
    const formattedInstructor = payload.instructor?.trim() || "";
    const numPrice = payload.priceBdt !== undefined ? Number(payload.priceBdt) : undefined;
    const origPrice = payload.originalPriceBdt !== undefined ? Number(payload.originalPriceBdt) : undefined;

    const parseList = (val: any): string[] | undefined => {
      if (val === undefined) return undefined;
      if (!val) return [];
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === "string") return val.split("\n").map((s) => s.trim()).filter(Boolean);
      return [];
    };

    // 1. Direct update in PostgreSQL via Prisma
    if (prisma && (await isPrismaReady())) {
      try {
        const existing = await prisma.course.findFirst({
          where: {
            OR: [{ id }, { slug: id }],
          },
        });
        const currentH: any =
          (typeof existing?.highlights === "string"
            ? JSON.parse(existing.highlights)
            : existing?.highlights) || {};

        const mergedHighlights: any = {
          ...currentH,
          ...(payload.highlights || {}),
        };
        if (payload.description !== undefined) {
          mergedHighlights.description = payload.description.trim();
        }
        if (payload.whatYouWillLearn !== undefined) {
          mergedHighlights.whatYouWillLearn = parseList(payload.whatYouWillLearn);
        }
        if (payload.requirements !== undefined) {
          mergedHighlights.requirements = parseList(payload.requirements);
        }
        if (payload.includes !== undefined) {
          mergedHighlights.includes = parseList(payload.includes);
        }

        await prisma.course.updateMany({
          where: {
            OR: [{ id }, { slug: id }],
          },
          data: {
            title: payload.title?.trim(),
            subtitle: payload.subtitle !== undefined ? payload.subtitle.trim() : undefined,
            badge: payload.badge,
            category: payload.category,
            level: payload.level,
            price: numPrice !== undefined ? `৳${numPrice.toLocaleString()}` : undefined,
            originalPrice: origPrice !== undefined ? `৳${origPrice.toLocaleString()}` : undefined,
            numericPrice: numPrice,
            numericOriginalPrice: origPrice,
            discountPct: payload.discountPct,
            image: formattedThumbnail || undefined,
            thumbnail: formattedThumbnail || undefined,
            trailerVideo: formattedTrailer || undefined,
            instructorId: payload.instructorId,
            instructorName: formattedInstructor || undefined,
            highlights: mergedHighlights,
            faqs: (payload.faqs as any) || undefined,
          },
        });
      } catch (dbErr: any) {
        console.warn("Prisma update course warning:", dbErr.message || dbErr);
      }
    }

    // 2. Always update persistent CMS override
    try {
      await saveCourseCmsOverride(id, {
        subtitle: payload.subtitle,
        badge: payload.badge,
        category: payload.category,
        level: payload.level,
        mainSlogan: payload.mainSlogan,
        heroSlogan: payload.heroSlogan,
        numericPrice: numPrice,
        numericOriginalPrice: origPrice,
        discountPct: payload.discountPct,
        instructorId: payload.instructorId,
        instructorName: formattedInstructor,
        highlights: payload.highlights,
        faqs: payload.faqs,
      });
    } catch (cmsErr: any) {
      console.warn("CMS OVERRIDE UPDATE WARNING:", cmsErr.message);
    }

    try {
      revalidatePath("/admin/courses");
      revalidatePath(`/admin/courses/${id}`);
      revalidatePath("/admin");
      revalidatePath("/courses");
      revalidatePath(`/courses/${id}`);
      revalidatePath(`/courses/${id}/curriculum`);
      revalidatePath(`/courses/${id}/instructor`);
      revalidatePath(`/courses/${id}/reviews`);
      revalidatePath(`/checkout/${id}`);
      revalidatePath(`/learn/${id}`);
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/courses");
      revalidatePath("/");
    } catch {}

    return {
      success: true,
      product: { id, handle: id, title: payload.title },
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
    // 1. Delete permanently from PostgreSQL via Prisma
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

    // 2. Scrub course slug from student user records in PostgreSQL
    if (prisma && (await isPrismaReady())) {
      try {
        const usersWithCourse = await prisma.user.findMany({
          where: {
            customEnrolledSlugs: { has: idOrSlug },
          },
        });
        for (const u of usersWithCourse) {
          await prisma.user.update({
            where: { id: u.id },
            data: {
              customEnrolledSlugs: u.customEnrolledSlugs.filter((s) => s !== idOrSlug),
              revokedSlugs: u.revokedSlugs.includes(idOrSlug)
                ? u.revokedSlugs
                : [...u.revokedSlugs, idOrSlug],
            },
          });
        }
      } catch (userScrubErr: any) {
        console.warn("User course scrub warning:", userScrubErr.message || userScrubErr);
      }
    }

    // 3. Scrub course from persistent customers json (fallback)
    try {
      const { getPersistentCustomers, savePersistentCustomer } = await import("@/lib/data/customers");
      const customers = await getPersistentCustomers();
      const normalizedTarget = idOrSlug.toLowerCase().trim();

      for (const cust of customers) {
        let changed = false;
        if (cust.customEnrolledSlugs && cust.customEnrolledSlugs.some((s) => s.toLowerCase() === normalizedTarget)) {
          cust.customEnrolledSlugs = cust.customEnrolledSlugs.filter((s) => s.toLowerCase() !== normalizedTarget);
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

    // 4. Scrub course key permanently from persistent courses CMS override
    try {
      const { deleteCourseCmsOverride } = await import("@/lib/data/courses-cms");
      await deleteCourseCmsOverride(idOrSlug);
    } catch (cmsErr) {
      console.error("FAILED TO SCRUB DELETED COURSE FROM CMS:", cmsErr);
    }

    // 5. Deep multi-route cache revalidation
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
