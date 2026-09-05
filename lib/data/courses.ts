export interface LessonItem {
  id: string;
  title: string;
  duration: string;
  isPreview?: boolean;
  isFreePreview?: boolean;
  r2_object_key?: string;
  r2Key?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export type CourseLesson = LessonItem;

export interface CurriculumModule {
  id: string;
  title: string;
  lessonsCount: number;
  duration: string;
  lessons: LessonItem[];
}

export type CourseModule = CurriculumModule;

export interface CourseFaqItem {
  question: string;
  answer: string;
}

export interface CourseDetail {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  category: string;
  rating: number;
  reviewsCount: string;
  studentsCount: string;
  updatedDate: string;
  level: string;
  price: string;
  originalPrice: string;
  discountPct: string;
  numericPrice: number;
  numericOriginalPrice: number;
  image: string;
  thumbnail?: string;
  trailerImage: string;
  trailerVideo?: string;
  instructorId?: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    experience: string;
    projects: string;
    students: string;
  };
  highlights: {
    hours: string;
    lessons: string;
    access: string;
    certificate: string;
  };
  description: string;
  mainSlogan?: string;
  heroSlogan?: string;
  whatYouWillLearn: string[];
  includes: string[];
  requirements: string[];
  curriculum: CurriculumModule[];
  faqs?: CourseFaqItem[];
}

export function resolveMediaUrl(urlOrKey?: string): string {
  if (!urlOrKey || typeof urlOrKey !== "string" || !urlOrKey.trim()) {
    return "";
  }
  const clean = urlOrKey.trim();

  // If already a base64 data URI, blob URI, or local relative path, return directly
  if (
    clean.startsWith("data:") ||
    clean.startsWith("blob:") ||
    clean.startsWith("/api/r2/") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  // If it's a Cloudflare R2 direct storage endpoint URL
  if (clean.includes("r2.cloudflarestorage.com")) {
    const bucketName = "lms-videos";
    if (clean.includes(`/${bucketName}/`)) {
      const key = clean.split(`/${bucketName}/`)[1];
      return `/api/r2/${key}`;
    }
    const match = clean.match(/r2\.cloudflarestorage\.com\/[^\/]+\/(.+)$/);
    if (match?.[1]) {
      return `/api/r2/${match[1]}`;
    }
  }

  // If it's a relative R2 object key
  if (clean.startsWith("thumbnails/") || clean.startsWith("lessons/")) {
    return `/api/r2/${clean}`;
  }

  return clean;
}

export function parseDurationToSeconds(dur?: string | number): number {
  if (!dur) return 0;
  if (typeof dur === "number") return Math.max(0, dur);
  const str = String(dur).trim().toLowerCase();

  // If format is mm:ss or hh:mm:ss
  if (str.includes(":")) {
    const parts = str.split(":").map((p) => parseFloat(p) || 0);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // mm:ss
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
    }
  }

  // If format is "30s", "10m", "1h 20m", "20 min", "1 hour"
  let totalSec = 0;
  const hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hours)/);
  const minsMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/);
  const secsMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)/);

  if (hoursMatch) totalSec += parseFloat(hoursMatch[1]) * 3600;
  if (minsMatch) totalSec += parseFloat(minsMatch[1]) * 60;
  if (secsMatch) totalSec += parseFloat(secsMatch[1]);

  if (totalSec > 0) return totalSec;

  const rawNum = parseFloat(str);
  if (!isNaN(rawNum)) {
    return rawNum > 60 ? rawNum : rawNum * 60;
  }

  return 0;
}

export function formatTotalDuration(lessons: Array<{ duration?: string | number }>): string {
  if (!lessons || lessons.length === 0) return "0 min";
  const totalSeconds = lessons.reduce((acc, l) => acc + parseDurationToSeconds(l.duration), 0);

  if (totalSeconds <= 0) return "0 min";
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Calculates the exact dynamic duration (hours and minutes) by summing all lessons across curriculum modules.
 */
export function getCourseDurationParts(course?: CourseDetail | null): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
} {
  if (!course) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, formatted: "0 min" };
  }

  let totalSeconds = 0;
  if (course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0) {
    for (const mod of course.curriculum) {
      if (mod.lessons && Array.isArray(mod.lessons)) {
        for (const l of mod.lessons) {
          totalSeconds += parseDurationToSeconds(l.duration);
        }
      }
    }
  }

  if (totalSeconds === 0 && course.highlights?.hours) {
    totalSeconds = parseDurationToSeconds(course.highlights.hours);
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = "";
  if (hours > 0 && minutes > 0) {
    formatted = `${hours} Hours ${minutes} Min`;
  } else if (hours > 0) {
    formatted = `${hours} Hours`;
  } else if (minutes > 0) {
    formatted = `${minutes} Min`;
  } else if (seconds > 0) {
    formatted = `${seconds} Sec`;
  } else {
    formatted = "0 Min";
  }

  return { hours, minutes, seconds, totalSeconds, formatted };
}

/**
 * Maps a raw Medusa v2 Product into the structured CourseDetail interface using robust metadata parsing.
 */
export function mapMedusaProductToCourse(product: any): CourseDetail {
  const meta = product?.metadata || {};
  const priceAmount =
    product?.variants?.[0]?.prices?.find(
      (p: any) => p.currency_code === "bdt"
    )?.amount ||
    product?.variants?.[0]?.prices?.[0]?.amount ||
    1299;

  // Robust parsing of curriculum (handles stringified JSON, double serialization, and nested arrays)
  let rawCurriculum = meta.curriculum ?? product?.curriculum;
  if (typeof rawCurriculum === "string") {
    try {
      rawCurriculum = JSON.parse(rawCurriculum);
    } catch {
      rawCurriculum = [];
    }
  }
  if (typeof rawCurriculum === "string") {
    try {
      rawCurriculum = JSON.parse(rawCurriculum);
    } catch {
      rawCurriculum = [];
    }
  }

  const mappedCurriculum: CurriculumModule[] = Array.isArray(rawCurriculum)
    ? rawCurriculum.map((m: any, idx: number) => {
        let lessonsArray = m.lessons;
        if (typeof lessonsArray === "string") {
          try {
            lessonsArray = JSON.parse(lessonsArray);
          } catch {
            lessonsArray = [];
          }
        }

        const lessonsList: LessonItem[] = Array.isArray(lessonsArray)
          ? lessonsArray.map((l: any, lIdx: number) => ({
              id: l.id || `${idx + 1}-${lIdx + 1}`,
              title: l.title || `Lesson ${lIdx + 1}`,
              duration: l.duration || "10:00",
              isPreview: Boolean(l.isPreview || l.isFreePreview),
              isFreePreview: Boolean(l.isPreview || l.isFreePreview),
              r2_object_key: l.r2_object_key || l.r2Key || "",
              r2Key: l.r2_object_key || l.r2Key || "",
              videoUrl: resolveMediaUrl(l.videoUrl || l.r2_object_key || l.r2Key),
              attachmentUrl: l.attachmentUrl || "",
              attachmentName: l.attachmentName || "",
            }))
          : [];

        const computedDuration = formatTotalDuration(lessonsList);

        return {
          id: m.id || `mod-${idx + 1}`,
          title: m.title || `Module ${idx + 1}`,
          lessonsCount: lessonsList.length,
          duration: computedDuration,
          lessons: lessonsList,
        };
      })
    : [];

  const totalLessonsCount = mappedCurriculum.reduce(
    (acc, mod) => acc + (mod.lessonsCount || mod.lessons?.length || 0),
    0
  );

  const rawThumbnail =
    product?.thumbnail ||
    meta.thumbnail ||
    meta.image ||
    product?.images?.[0]?.url ||
    "";
  const resolvedThumb = resolveMediaUrl(rawThumbnail);

  const rawTrailer =
    meta.trailer_url ||
    meta.trailerUrl ||
    product?.trailerUrl ||
    "";
  const resolvedTrailer = resolveMediaUrl(rawTrailer);

  return {
    slug: product?.handle || `course-${product?.id || Date.now()}`,
    title: product?.title || "Masterclass",
    subtitle: meta.subtitle || product?.description || "Master professional video editing workflows from zero to hero.",
    badge: meta.badge || "Bestseller",
    category: meta.category || "Video Editing & Filmmaking",
    rating: meta.rating ? Number(meta.rating) : 5.0,
    reviewsCount: meta.reviewsCount || "0",
    studentsCount: meta.studentsCount || "0 Enrolled",
    updatedDate: meta.updatedDate || "2026",
    level: meta.level || "Beginner to Advanced",
    price: `৳${priceAmount.toLocaleString()}`,
    originalPrice:
      meta.originalPrice ||
      (meta.numericOriginalPrice
        ? `৳${Number(meta.numericOriginalPrice).toLocaleString()}`
        : `৳${Math.round(priceAmount * 1.8).toLocaleString()}`),
    discountPct:
      meta.discountPct ||
      (meta.numericOriginalPrice && Number(meta.numericOriginalPrice) > priceAmount
        ? `${Math.round((1 - priceAmount / Number(meta.numericOriginalPrice)) * 100)}% OFF`
        : "45% OFF"),
    numericPrice: priceAmount,
    numericOriginalPrice: meta.numericOriginalPrice
      ? Number(meta.numericOriginalPrice)
      : Math.round(priceAmount * 1.8),
    image:
      resolvedThumb ||
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    thumbnail:
      resolvedThumb ||
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    trailerImage:
      resolvedThumb ||
      meta.trailerImage ||
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    trailerVideo: resolvedTrailer || rawTrailer || "",
    instructorId: meta.instructorId || "",
    instructor: {
      name: meta.instructor || "Sakil Ahmed",
      role: meta.instructorRole || "Lead Filmmaker & Video Editor",
      avatar:
        meta.instructorAvatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      bio: "8+ years in commercial video editing and digital filmmaking.",
      experience: "8+ Years",
      projects: "400+",
      students: "10K+",
    },
    highlights: {
      hours:
        meta.hours ||
        getCourseDurationParts({
          curriculum: mappedCurriculum,
        } as CourseDetail).formatted,
      lessons: meta.lessons || `${totalLessonsCount > 0 ? totalLessonsCount : 0} Lessons`,
      access: "Lifetime Access",
      certificate: "Certificate Included",
    },
    description: product?.description || "Comprehensive masterclass on Sakil Hub.",
    mainSlogan: meta.mainSlogan || "The complete roadmap to becoming a professional video editor.",
    heroSlogan: meta.heroSlogan || "Master Commercial Editing & Filmmaking",
    whatYouWillLearn: Array.isArray(meta.whatYouWillLearn)
      ? meta.whatYouWillLearn
      : typeof meta.whatYouWillLearn === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(meta.whatYouWillLearn);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
          } catch {}
          return meta.whatYouWillLearn.split("\n").map((s: string) => s.trim()).filter(Boolean);
        })()
      : [],
    includes: Array.isArray(meta.includes)
      ? meta.includes
      : typeof meta.includes === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(meta.includes);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
          } catch {}
          return meta.includes.split("\n").map((s: string) => s.trim()).filter(Boolean);
        })()
      : [],
    requirements: Array.isArray(meta.requirements)
      ? meta.requirements
      : typeof meta.requirements === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(meta.requirements);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
          } catch {}
          return meta.requirements.split("\n").map((s: string) => s.trim()).filter(Boolean);
        })()
      : [],
    curriculum: mappedCurriculum,
    faqs: Array.isArray(meta.faqs)
      ? meta.faqs
      : typeof meta.faqs === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(meta.faqs);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
          return [];
        })()
      : [],
  };
}

/**
 * Fetches published masterclasses live from the Medusa Store and LMS APIs without cache.
 */
export async function getLiveStorefrontCourses(): Promise<CourseDetail[]> {
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  let list: CourseDetail[] = [];

  try {
    // 1. Query Direct LMS Catalog API (has full metadata without field restrictions)
    const lmsRes = await fetch(`${backendUrl}/lms/courses`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (lmsRes.ok) {
      const lmsData = await lmsRes.json().catch(() => null);
      if (lmsData?.courses && Array.isArray(lmsData.courses) && lmsData.courses.length > 0) {
        list = lmsData.courses.map(mapMedusaProductToCourse);
      }
    }

    // 2. Query Medusa Store API if empty
    if (list.length === 0) {
      const res = await fetch(`${backendUrl}/store/products?limit=50&fields=*metadata`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          list = data.products.map(mapMedusaProductToCourse);
        }
      }
    }
  } catch {
    // Backend offline or empty
  }

  // 3. Merge with persistent CMS overrides
  try {
    const { getPersistentCoursesCms } = await import("@/lib/data/courses-cms");
    const cmsMap = await getPersistentCoursesCms();

    for (const item of list) {
      const override = cmsMap[item.slug] || cmsMap[item.slug.toLowerCase()];
      if (override) {
        if (override.faqs && override.faqs.length > 0) item.faqs = override.faqs;
        if (override.highlights) item.highlights = { ...item.highlights, ...override.highlights };
        if (override.subtitle) item.subtitle = override.subtitle;
        if (override.badge) item.badge = override.badge;
      }
    }

    // Add any courses recorded in CMS that are missing from Medusa
    for (const [key, cmsItem] of Object.entries(cmsMap)) {
      const exists = list.some((c) => c.slug.toLowerCase() === key.toLowerCase());
      if (!exists && cmsItem) {
        list.push({
          slug: key,
          title: key
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          subtitle: cmsItem.subtitle || "Masterclass on Sakil Hub.",
          badge: cmsItem.badge || "Bestseller",
          category: cmsItem.category || "Video Editing",
          rating: 5.0,
          reviewsCount: "0",
          studentsCount: "0 Enrolled",
          updatedDate: "2026",
          level: cmsItem.level || "Beginner to Advanced",
          price: `৳${(cmsItem.numericPrice || 1299).toLocaleString()}`,
          originalPrice: `৳${(cmsItem.numericOriginalPrice || 3500).toLocaleString()}`,
          discountPct: cmsItem.discountPct || "63% OFF",
          numericPrice: cmsItem.numericPrice || 1299,
          numericOriginalPrice: cmsItem.numericOriginalPrice || 3500,
          image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
          trailerImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
          trailerVideo: "",
          instructor: {
            name: cmsItem.instructorName || "Sakil Ahmed",
            role: cmsItem.instructorRole || "Lead Filmmaker & Video Editor",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
            bio: "8+ years in commercial video editing.",
            experience: "8+ Years",
            projects: "400+",
            students: "10K+",
          },
          highlights: {
            hours: cmsItem.highlights?.hours || "18+ Hours",
            lessons: cmsItem.highlights?.lessons || "Comprehensive",
            access: cmsItem.highlights?.access || "Lifetime Access",
            certificate: cmsItem.highlights?.certificate || "Certificate Included",
          },
          description: cmsItem.subtitle || "Comprehensive masterclass on Sakil Hub.",
          whatYouWillLearn: [],
          includes: [],
          requirements: [],
          curriculum: cmsItem.curriculum || [],
          faqs: cmsItem.faqs || [],
        });
      }
    }
  } catch {}

  return list;
}

/**
 * Fetches a single masterclass by handle or ID directly from Medusa with strict cache bypass.
 */
export async function getLiveCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  try {
    // 1. Query LMS Direct Route
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
          return mapMedusaProductToCourse(lmsData.product);
        }
      }
    } catch {
      // Continue to next strategy
    }

    // 2. Query Storefront API with wildcard fields
    try {
      const res = await fetch(`${backendUrl}/store/products?handle=${slug}&fields=*metadata`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.products?.[0]) {
          return mapMedusaProductToCourse(data.products[0]);
        }
      }
    } catch {
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
              c.title?.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-") === slug
          );
          if (found) {
            return mapMedusaProductToCourse(found);
          }
        }
      }
    } catch {
      // Backend unreachable
    }

    // 4. CMS Override Fallback
    try {
      const { getCourseCmsOverride } = await import("@/lib/data/courses-cms");
      const cmsOverride = await getCourseCmsOverride(slug);
      if (cmsOverride) {
        return {
          slug,
          title: slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          subtitle: cmsOverride.subtitle || "Masterclass on Sakil Hub.",
          badge: cmsOverride.badge || "Bestseller",
          category: cmsOverride.category || "Video Editing",
          rating: 5.0,
          reviewsCount: "0",
          studentsCount: "0 Enrolled",
          updatedDate: "2026",
          level: cmsOverride.level || "Beginner to Advanced",
          price: `৳${(cmsOverride.numericPrice || 1299).toLocaleString()}`,
          originalPrice: `৳${(cmsOverride.numericOriginalPrice || 3500).toLocaleString()}`,
          discountPct: cmsOverride.discountPct || "63% OFF",
          numericPrice: cmsOverride.numericPrice || 1299,
          numericOriginalPrice: cmsOverride.numericOriginalPrice || 3500,
          image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
          trailerImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
          trailerVideo: "",
          instructor: {
            name: cmsOverride.instructorName || "Sakil Ahmed",
            role: cmsOverride.instructorRole || "Lead Filmmaker & Video Editor",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
            bio: "8+ years in commercial video editing.",
            experience: "8+ Years",
            projects: "400+",
            students: "10K+",
          },
          highlights: {
            hours: cmsOverride.highlights?.hours || "18+ Hours",
            lessons: cmsOverride.highlights?.lessons || "Comprehensive",
            access: cmsOverride.highlights?.access || "Lifetime Access",
            certificate: cmsOverride.highlights?.certificate || "Certificate Included",
          },
          description: cmsOverride.subtitle || "Comprehensive masterclass on Sakil Hub.",
          whatYouWillLearn: [],
          includes: [],
          requirements: [],
          curriculum: cmsOverride.curriculum || [],
          faqs: cmsOverride.faqs || [],
        };
      }
    } catch {}
  } catch (err) {
    console.error("getLiveCourseBySlug error:", err);
  }

  return null;
}

export const coursesData: Record<string, CourseDetail> = {};
export const courses: CourseDetail[] = [];

/**
 * Resolves the genuine first playable lesson ID from a course's curriculum.
 * Returns empty string if curriculum has no lessons.
 */
export function getFirstLessonId(course?: CourseDetail | null): string {
  if (!course?.curriculum || !Array.isArray(course.curriculum) || course.curriculum.length === 0) {
    return "";
  }
  for (const mod of course.curriculum) {
    if (mod.lessons && Array.isArray(mod.lessons) && mod.lessons.length > 0) {
      const first = mod.lessons[0];
      if (first?.id) return first.id;
    }
  }
  return "";
}

export function getCourseBySlug(slug: string): CourseDetail {
  return mapMedusaProductToCourse({
    handle: slug,
    title: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  });
}
