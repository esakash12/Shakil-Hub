import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Play,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getEnrolledCoursesAction, EnrolledCourseItem } from "@/lib/actions/student";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const isEnrollmentSuccess = resolvedParams?.enrollment === "success";

  const enrolledCourses: EnrolledCourseItem[] = await getEnrolledCoursesAction();

  const completedCourses = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) >= 100
  );
  const inProgressCourses = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) < 100
  );

  const tabs = [
    `All Courses (${enrolledCourses.length})`,
    `In Progress (${inProgressCourses.length})`,
    `Completed (${completedCourses.length})`,
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Success Notification Banner */}
      {isEnrollmentSuccess && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 sm:p-5 flex items-center justify-between gap-4 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Enrollment Completed!
              </h4>
              <p className="text-xs text-emerald-300/80 font-normal">
                Your course has been added to your student portal. You now have lifetime access.
              </p>
            </div>
          </div>
          <Link
            href={`/learn/${enrolledCourses[0]?.slug || "premiere-pro-masterclass"}/${enrolledCourses[0]?.firstLessonId || "2-3-basic-timeline"}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Learning</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>My Learning</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Enrolled Courses
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Manage your active masterclasses, continue watching lessons, and download practice assets.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/5">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Course Cards Grid OR Empty State */}
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div
              key={course.slug}
              className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]"
            >
              {/* Card Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
                {(course.thumbnail || course.image) ? (
                  <Image
                    src={course.thumbnail || course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 shadow-inner">
                      <Play className="w-4 h-4 fill-blue-400 ml-0.5" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-tight line-clamp-1">
                      {course.title}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-blue-600/80 backdrop-blur-md text-[10px] font-bold text-white">
                  {course.badge}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  {course.highlights.hours}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] text-gray-400 block font-normal">
                    By {course.instructor.name}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Progress</span>
                    <span className="text-blue-400 font-semibold">{course.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <Link
                    href={
                      course.firstLessonId
                        ? `/learn/${course.slug}/${course.firstLessonId}`
                        : `/courses/${course.slug}`
                    }
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all group-hover:scale-[1.02]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Continue Learning</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Premium Empty State */
        <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 p-10 sm:p-16 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-600/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                You haven&apos;t enrolled in any courses yet
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Explore our masterclasses in Premiere Pro, After Effects, and DaVinci Resolve to get started on your creative journey.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <span>Explore Masterclasses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
