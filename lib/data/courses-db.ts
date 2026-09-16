import 'server-only';
import { CourseDetail, mapDbCourseToCourseDetail } from './courses';
import { prisma, isPrismaReady } from '../db/prisma';
import { getPersistentCoursesCms } from './courses-cms';

/**
 * Fetches published masterclasses directly from PostgreSQL database.
 */
export async function getLiveStorefrontCourses(): Promise<CourseDetail[]> {
  try {
    if (prisma && (await isPrismaReady())) {
      const dbCourses = await prisma.course.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
      });
      return (dbCourses || []).map(mapDbCourseToCourseDetail);
    }
  } catch (err: any) {
    console.warn('Prisma query getLiveStorefrontCourses error:', err.message || err);
  }

  // Fallback: load from persistent courses CMS
  try {
    const cmsMap = await getPersistentCoursesCms();
    const cmsSlugs = Object.keys(cmsMap);
    if (cmsSlugs.length > 0) {
      return cmsSlugs.map((slug) => {
        const item = cmsMap[slug];
        return {
          slug,
          title: item.title || slug.replace(/-/g, ' '),
          subtitle: item.subtitle || '',
          badge: item.badge || 'Featured',
          category: item.category || 'Video Editing',
          rating: 5.0,
          reviewsCount: '0',
          studentsCount: '0',
          updatedDate: 'March 2026',
          level: item.level || 'Beginner to Advanced',
          price: `৳${(item.numericPrice || 1299).toLocaleString()}`,
          originalPrice: `৳${(item.numericOriginalPrice || 2858).toLocaleString()}`,
          discountPct: item.discountPct || '45% OFF',
          numericPrice: item.numericPrice || 1299,
          numericOriginalPrice: item.numericOriginalPrice || 2858,
          image: item.image || item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
          thumbnail: item.thumbnail || item.image || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
          trailerImage: item.trailerImage || item.thumbnail || item.image || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
          trailerVideo: item.trailerVideo || '',
          instructorId: item.instructorId || 'sakil-ahmed',
          instructor: {
            name: item.instructorName || 'Sakil Ahmed',
            role: 'Instructor',
            avatar: '',
            bio: '',
            experience: '',
            projects: '',
            students: '',
            socials: {},
          },
          highlights: {
            hours: item.highlights?.hours || '20+ Hours',
            lessons: item.highlights?.lessons || '10 Lessons',
            access: 'Lifetime Access',
            certificate: 'Certificate Included',
          },
          description: item.subtitle || '',
          mainSlogan: item.mainSlogan || '',
          heroSlogan: item.heroSlogan || '',
          whatYouWillLearn: [],
          includes: [],
          requirements: [],
          curriculum: item.curriculum || [],
          faqs: item.faqs || [],
        };
      });
    }
  } catch {}

  return [];
}

/**
 * Fetches a single masterclass directly from PostgreSQL database.
 */
export async function getLiveCourseBySlug(slug: string): Promise<CourseDetail | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const c = await prisma.course.findFirst({
        where: {
          OR: [
            { slug: { equals: cleanSlug, mode: 'insensitive' } },
            { id: cleanSlug },
          ],
        },
      });
      if (c) {
        return mapDbCourseToCourseDetail(c);
      }
      return null;
    }
  } catch (err: any) {
    console.warn('Prisma query getLiveCourseBySlug error:', err.message || err);
  }

  // Fallback: Check persistent courses CMS
  try {
    const cmsMap = await getPersistentCoursesCms();
    const item = cmsMap[cleanSlug] || cmsMap[cleanSlug.toLowerCase()];
    if (item) {
      return {
        slug: cleanSlug,
        title: item.title || cleanSlug.replace(/-/g, ' '),
        subtitle: item.subtitle || '',
        badge: item.badge || 'Featured',
        category: item.category || 'Video Editing',
        rating: 5.0,
        reviewsCount: '0',
        studentsCount: '0',
        updatedDate: 'March 2026',
        level: item.level || 'Beginner to Advanced',
        price: `৳${(item.numericPrice || 1299).toLocaleString()}`,
        originalPrice: `৳${(item.numericOriginalPrice || 2858).toLocaleString()}`,
        discountPct: item.discountPct || '45% OFF',
        numericPrice: item.numericPrice || 1299,
        numericOriginalPrice: item.numericOriginalPrice || 2858,
        image: item.image || item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
        thumbnail: item.thumbnail || item.image || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
        trailerImage: item.trailerImage || item.thumbnail || item.image || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
        trailerVideo: item.trailerVideo || '',
        instructorId: item.instructorId || 'sakil-ahmed',
        instructor: {
          name: item.instructorName || 'Sakil Ahmed',
          role: 'Instructor',
          avatar: '',
          bio: '',
          experience: '',
          projects: '',
          students: '',
          socials: {},
        },
        highlights: {
          hours: item.highlights?.hours || '20+ Hours',
          lessons: item.highlights?.lessons || '10 Lessons',
          access: 'Lifetime Access',
          certificate: 'Certificate Included',
        },
        description: item.subtitle || '',
        mainSlogan: item.mainSlogan || '',
        heroSlogan: item.heroSlogan || '',
        whatYouWillLearn: [],
        includes: [],
        requirements: [],
        curriculum: item.curriculum || [],
        faqs: item.faqs || [],
      };
    }
  } catch {}

  return null;
}
