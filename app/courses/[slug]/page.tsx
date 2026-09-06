import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles, Star, CheckCircle2, Clock } from "lucide-react";
import CourseAnchorNav from "@/components/course/CourseAnchorNav";
import CourseAbout from "@/components/course/CourseAbout";
import CourseCurriculum from "@/components/course/CourseCurriculum";
import CourseInstructor from "@/components/course/CourseInstructor";
import CourseReviews from "@/components/course/CourseReviews";
import CourseFAQ from "@/components/course/CourseFAQ";
import MobileHeroTrailerPlayer from "@/components/course/MobileHeroTrailerPlayer";
import MobileQuickStatsAndFeatures from "@/components/course/MobileQuickStatsAndFeatures";
import MobileCurriculumPlayer from "@/components/course/MobileCurriculumPlayer";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { getEnrolledCoursesAction, getPendingOrdersAction } from "@/lib/actions/student";
import { CourseDetail } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    return { title: "Course Not Found | Sakil Hub" };
  }

  const live = await getLiveCourseAction(slug);
  if (!live.success || !live.course) {
    return {
      title: "Course Not Found | Sakil Hub",
      description: "The requested masterclass could not be found.",
    };
  }

  const course = live.course;
  return {
    title: `${course.title} | Sakil Hub`,
    description:
      course.subtitle ||
      `Master ${course.title} from zero to pro with practical projects and lifetime mentorship at Sakil Hub.`,
  };
}

export default async function CourseSinglePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    notFound();
  }

  const [live, enrolledCourses, pendingOrders] = await Promise.all([
    getLiveCourseAction(slug),
    getEnrolledCoursesAction().catch(() => []),
    getPendingOrdersAction().catch(() => []),
  ]);

  if (!live.success || !live.course) {
    notFound();
  }

  const course: CourseDetail = live.course;
  const isEnrolled =
    Array.isArray(enrolledCourses) && enrolledCourses.some((c) => c.slug?.toLowerCase() === slug.toLowerCase());
  const isPending =
    !isEnrolled &&
    Array.isArray(pendingOrders) &&
    pendingOrders.some((o) => o.courseSlug?.toLowerCase() === slug.toLowerCase());

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 select-none">
      {/* ========================================================================= */}
      {/* === STRICT MOBILE DOM SEQUENCE (Mobile Only: Steps 1, 2, 3)          === */}
      {/* ========================================================================= */}
      <div className="block lg:hidden space-y-4 sm:space-y-6">
        {/* Step 1: Top Hero Trailer (Strictly Main Trailer - Never Interrupted by Previews) */}
        <MobileHeroTrailerPlayer course={course} isEnrolled={isEnrolled} />

        {/* Step 2: Quick Stats & Features (Price, Duration, Features from Desktop Card) */}
        <MobileQuickStatsAndFeatures
          course={course}
          slug={slug}
          isEnrolled={isEnrolled}
          isPending={isPending}
        />

        {/* Step 3: Curriculum Player (2nd Player - Plays Free Previews Clicked Below) */}
        <MobileCurriculumPlayer course={course} />
      </div>

      {/* ========================================================================= */}
      {/* === STEP 4: CORE CONTENT (Visible on Mobile & Desktop)                === */}
      {/* ========================================================================= */}

      {/* 1. Course Header Block (Top of Left Column) */}
      <div className="space-y-4 text-left">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <Link href="/courses" className="hover:text-white transition-colors">
            Courses
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-cyan-400 font-medium truncate max-w-xs">
            {course.title}
          </span>
        </nav>

        {/* Status / Masterclass Badge */}
        <div className="w-fit">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isEnrolled
                ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : isPending
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            }`}
          >
            {isEnrolled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-bold">Enrolled Student Access</span>
              </>
            ) : isPending ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-300 font-bold">Enrollment Pending Verification</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{course.badge || "Featured"} Masterclass</span>
              </>
            )}
          </div>
        </div>

        {/* Massive Course Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.25]">
          {course.title}
        </h1>

        {/* Short Subtitle / Description */}
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
          {course.subtitle || course.description}
        </p>

        {/* Ratings & Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 pt-1">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md text-white font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{course.rating}</span>
            <span className="text-gray-400 font-normal">
              ({course.studentsCount || "0 Enrolled"})
            </span>
          </div>
          <span className="hidden sm:inline text-gray-600">•</span>
          <span className="text-gray-300 font-medium">By {course.instructor.name}</span>
          <span className="hidden sm:inline text-gray-600">•</span>
          <span className="text-gray-400">Updated: {course.updatedDate}</span>
          <span className="hidden sm:inline text-gray-600">•</span>
          <span className="text-cyan-400 font-medium">{course.level || "Beginner to Pro"}</span>
        </div>
      </div>

      {/* 2. Sticky Sub-Navigation Bar (About, Curriculum, Instructor, Reviews, FAQ) */}
      <CourseAnchorNav reviewsCount={course.reviewsCount} />

      {/* 3. Section: About This Course (#about) */}
      <CourseAbout initialCourse={course} />

      {/* 4. Section: Course Curriculum (#curriculum) */}
      <CourseCurriculum initialCourse={course} slug={slug} />

      {/* 5. Section: Instructor Profile (#instructor) */}
      <CourseInstructor initialCourse={course} />

      {/* 6. Section: Reviews & Ratings (#reviews) */}
      <CourseReviews initialCourse={course} />

      {/* 7. Section: Frequently Asked Questions (#faq) */}
      <CourseFAQ faqs={course.faqs} />
    </div>
  );
}
