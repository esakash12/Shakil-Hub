import React from "react";
import { Sparkles } from "lucide-react";
import { fetchAdminStudentsAction, AdminStudentItem } from "@/lib/actions/admin-students";
import { getLiveStorefrontCoursesAction } from "@/lib/actions/storefront-courses";
import StudentDirectoryClient from "@/components/admin/StudentDirectoryClient";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const [studentsRes, coursesRes] = await Promise.all([
    fetchAdminStudentsAction(),
    getLiveStorefrontCoursesAction(),
  ]);

  const students: AdminStudentItem[] = studentsRes?.students || [];
  const courses = (coursesRes?.courses || []).map((c) => ({
    slug: c.slug,
    title: c.title,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>User Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Registered & Enrolled Students
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Advanced management engine for student access, suspension/bans, custom notices, and course entitlements.
        </p>
      </div>

      {/* Interactive Directory Table with Search & Filters */}
      <StudentDirectoryClient
        initialStudents={students}
        availableCourses={courses.length > 0 ? courses : undefined}
      />
    </div>
  );
}
