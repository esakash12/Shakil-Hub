import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCustomerProfile } from "@/lib/actions/auth";
import {
  getEnrolledCoursesAction,
  EnrolledCourseItem,
  getStudentNoticesAction,
} from "@/lib/actions/student";
import { getUserCertificatesAction, CertificateItem } from "@/lib/actions/certificates";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentCertificates from "@/components/dashboard/RecentCertificates";
import QuickLinks from "@/components/dashboard/QuickLinks";
import StudentNoticeBanner from "@/components/dashboard/StudentNoticeBanner";
import { GraduationCap, ArrowRight, Sparkles, Play, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const [customer, enrolledCourses, certificates, notices] = await Promise.all([
    getCustomerProfile(),
    getEnrolledCoursesAction(),
    getUserCertificatesAction(),
    getStudentNoticesAction(),
  ]);

  const firstName = customer?.first_name || "Student";

  const totalCompletedLessons = enrolledCourses.reduce(
    (acc, c) => acc + (c.completedLessons || 0),
    0
  );

  let totalMinutesWatched = 0;
  for (const c of enrolledCourses) {
    const totalLessons = c.totalLessons || 1;
    const completed = c.completedLessons || 0;
    const rawHours = parseFloat(c.highlights?.hours || "12") || 12;
    const courseMinutes = rawHours * 60;
    totalMinutesWatched += Math.round((completed / totalLessons) * courseMinutes);
  }
  const totalHoursWatched = (totalMinutesWatched / 60).toFixed(1);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Admin Notices & Direct Alerts */}
      <StudentNoticeBanner initialNotices={notices} />

      {/* Personalized Greeting Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Student Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Continue your learning journey and track your video editing masterclasses.
        </p>
      </div>

      {/* 4 Metric Stats Cards */}
      <DashboardStats
        enrolledCount={enrolledCourses.length}
        completedLessons={totalCompletedLessons}
        hoursWatched={totalHoursWatched}
        certificatesCount={certificates.length}
      />

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Enrolled Courses */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Enrolled Courses ({enrolledCourses.length})
            </h2>
            <Link
              href={enrolledCourses.length > 0 ? "/dashboard/courses" : "/courses"}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {enrolledCourses.length > 0 ? "View All →" : "Browse All →"}
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledCourses.map((course: EnrolledCourseItem) => (
                <div
                  key={course.slug}
                  className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
                    {(course.thumbnail || course.image) ? (
                      <Image
                        src={course.thumbnail || course.image}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
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

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] text-gray-400 block font-normal">
                        By {course.instructor.name}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    <div className="space-y-1.5">
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

                    <Link
                      href={
                        course.firstLessonId
                          ? `/learn/${course.slug}/${course.firstLessonId}`
                          : `/courses/${course.slug}`
                      }
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Continue Learning</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Premium Empty State Card */
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 p-8 sm:p-12 text-center overflow-hidden backdrop-blur-xl transition-all">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <GraduationCap className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    You haven&apos;t enrolled in any courses yet
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-normal">
                    Unlock access to 90+ hands-on lessons, downloadable project files, and lifetime video editing mentorship.
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

        {/* Right Column: Certificates & Quick Links */}
        <div className="xl:col-span-4 space-y-6">
          <RecentCertificates initialCertificates={certificates} />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
