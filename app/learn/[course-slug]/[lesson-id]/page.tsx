import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import ClassroomPlayerContainer from "@/components/learn/ClassroomPlayerContainer";
import CourseCurriculumSidebar from "@/components/learn/CourseCurriculumSidebar";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { getEnrolledCoursesAction } from "@/lib/actions/student";
import { CourseDetail, CourseLesson } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

interface LessonPageProps {
  params: Promise<{
    "course-slug": string;
    "lesson-id": string;
  }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.["course-slug"] || "";
  const lessonId = resolvedParams?.["lesson-id"] || "";

  if (!courseSlug || !lessonId) {
    return { title: "Classroom | Sakil Hub" };
  }

  let courseTitle = "Masterclass";
  try {
    const res = await getLiveCourseAction(courseSlug);
    if (res.success && res.course) {
      courseTitle = res.course.title;
    }
  } catch {}

  const formattedLesson = lessonId
    .split("-")
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${formattedLesson || "Lesson"} | ${courseTitle} | Sakil Hub Classroom`,
    description: `Watch ${courseTitle} lessons in full HD with Cloudflare R2 high-speed streaming.`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.["course-slug"];
  const lessonId = resolvedParams?.["lesson-id"];

  if (!courseSlug || !lessonId) {
    notFound();
  }

  // 1. Fetch user profile, enrollment status, and live course in parallel
  const [customer, enrolledCourses, live] = await Promise.all([
    getCustomerProfile(),
    getEnrolledCoursesAction().catch(() => []),
    getLiveCourseAction(courseSlug),
  ]);

  const cookieStore = await cookies();
  const hasToken = Boolean(
    cookieStore.get("sakil_customer_token")?.value ||
    cookieStore.get("sakil_customer_info")?.value
  );

  // Auth gatekeeper: User must be logged in
  if (!customer) {
    if (hasToken) {
      redirect("/login?error=account_suspended&logout=true");
    }
    redirect(`/login?redirect=/learn/${courseSlug}/${lessonId}`);
  }

  // Existence gatekeeper: Course must exist
  if (!live.success || !live.course) {
    notFound();
  }
  const course = live.course;

  // Enrollment gatekeeper: User must have purchased or been granted access
  const isEnrolled =
    Array.isArray(enrolledCourses) && enrolledCourses.some((c) => c.slug === courseSlug);

  if (!isEnrolled) {
    redirect(`/courses/${courseSlug}?error=not_enrolled`);
  }

  // 2. Flatten all lessons across all modules
  const allLessons: CourseLesson[] =
    course.curriculum && course.curriculum.length > 0
      ? course.curriculum.flatMap((m) => m.lessons || [])
      : [];

  // 3. Find current active lesson (STRICT: Must exist in curriculum)
  const activeIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (activeIndex === -1) {
    notFound();
  }

  const currentLesson: CourseLesson = allLessons[activeIndex];

  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : undefined;
  const nextLesson =
    activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : undefined;

  const currentLessonTitle = currentLesson.title || "Masterclass Lesson";
  const videoKey =
    currentLesson.r2_object_key ||
    currentLesson.r2Key ||
    currentLesson.videoUrl ||
    "";

  // Find module title for current lesson
  const currentModule = course.curriculum?.find((m) =>
    m.lessons?.some((l) => l.id === (currentLesson?.id || lessonId))
  );

  return (
    <div className="min-h-screen bg-black text-white py-4 sm:py-6 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {/* Top Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto no-scrollbar py-1"
        >
          <Link href="/" className="hover:text-white transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <Link href="/courses" className="hover:text-white transition-colors shrink-0">
            Courses
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <Link
            href={`/courses/${courseSlug}`}
            className="hover:text-white transition-colors truncate max-w-[150px] sm:max-w-xs"
          >
            {course.title}
          </Link>
          {currentModule && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
              <span className="text-gray-400 shrink-0 truncate max-w-[120px]">
                {currentModule.title}
              </span>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
          <span className="text-blue-400 font-medium truncate">
            {currentLessonTitle}
          </span>
        </nav>

        {/* Main 2-Column Classroom Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: 65-70% (Live Secure Video Player + Bound Lesson Tabs) */}
          <div className="lg:col-span-8 space-y-6">
            <ClassroomPlayerContainer
              videoKey={videoKey}
              currentLessonTitle={currentLessonTitle}
              poster={course.thumbnail || course.image}
              courseSlug={courseSlug}
              lessonId={currentLesson?.id || lessonId}
              moduleTitle={currentModule?.title || "Module"}
              duration={currentLesson?.duration || "15 min"}
              attachmentUrl={currentLesson?.attachmentUrl}
              attachmentName={currentLesson?.attachmentName}
              prevLessonId={prevLesson?.id}
              nextLessonId={nextLesson?.id}
            />
          </div>

          {/* Right Column: 30-35% (Sticky Dynamic Playlist Sidebar) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <CourseCurriculumSidebar
              activeLessonId={currentLesson?.id || lessonId}
              courseSlug={courseSlug}
              curriculum={course.curriculum}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
