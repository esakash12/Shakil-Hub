import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LayoutDashboard, ArrowLeft } from "lucide-react";
import ClassroomPlayerContainer from "@/components/learn/ClassroomPlayerContainer";
import CourseCurriculumSidebar from "@/components/learn/CourseCurriculumSidebar";
import { redirect, notFound } from "next/navigation";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { CourseDetail, CourseLesson } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

interface DashboardLearnPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: DashboardLearnPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) return { title: "Classroom | Sakil Hub" };

  const live = await getLiveCourseAction(slug);
  const title = live?.success && live.course ? live.course.title : "Classroom";

  return {
    title: `Classroom: ${title} | Sakil Hub`,
    description: `Watch lessons in your dedicated classroom workspace.`,
  };
}

export default async function DashboardLearnPage({
  params,
}: DashboardLearnPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  const live = await getLiveCourseAction(slug);
  if (!live.success || !live.course) {
    notFound();
  }

  const course: CourseDetail = live.course;

  const allLessons: CourseLesson[] =
    course.curriculum && course.curriculum.length > 0
      ? course.curriculum.flatMap((m) => m.lessons || [])
      : [];

  const defaultLesson = allLessons[0];
  const nextLesson = allLessons[1];

  const defaultLessonTitle =
    defaultLesson?.title || "Course Overview & Project Files";
  const videoKey =
    defaultLesson?.r2_object_key ||
    defaultLesson?.r2Key ||
    defaultLesson?.videoUrl ||
    "";

  const defaultModule = course.curriculum?.find((m) =>
    m.lessons?.some((l) => l.id === defaultLesson?.id)
  );

  return (
    <div className="min-h-screen bg-black text-white py-4 sm:py-6 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {/* Classroom Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto no-scrollbar py-1"
          >
            <Link
              href="/dashboard/courses"
              className="hover:text-white transition-colors flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>My Courses</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
            <span className="text-gray-300 font-medium truncate max-w-xs">
              {course.title}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
            <span className="text-blue-400 font-medium truncate">
              {defaultLessonTitle}
            </span>
          </nav>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </Link>
        </div>

        {/* Main 2-Column Classroom Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: 65-70% (Live Secure Video Player & Bound Lesson Tabs) */}
          <div className="lg:col-span-8 space-y-6">
            <ClassroomPlayerContainer
              videoKey={videoKey}
              currentLessonTitle={defaultLessonTitle}
              poster={course.thumbnail || course.image}
              courseSlug={course.slug}
              lessonId={defaultLesson?.id || "1-1"}
              moduleTitle={defaultModule?.title || "Module"}
              duration={defaultLesson?.duration || "15 min"}
              attachmentUrl={defaultLesson?.attachmentUrl}
              attachmentName={defaultLesson?.attachmentName}
              nextLessonId={nextLesson?.id}
            />
          </div>

          {/* Right Column: 30-35% (Curriculum Playlist Sidebar) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <CourseCurriculumSidebar
              activeLessonId={defaultLesson?.id || "1-1"}
              courseSlug={course.slug}
              curriculum={course.curriculum}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
