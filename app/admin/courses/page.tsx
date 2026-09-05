import React from "react";
import Link from "next/link";
import { Plus, ExternalLink, Sparkles } from "lucide-react";
import { getLiveStorefrontCourses } from "@/lib/data/courses";
import AdminCoursesClient from "@/components/admin/AdminCoursesClient";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const liveCourses = await getLiveStorefrontCourses();

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Curriculum Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Masterclasses & Courses ({liveCourses.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Live catalog synchronized directly with Medusa PostgreSQL database with 1-click hard deletion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Catalog</span>
          </Link>

          <Link
            href="/admin/courses/create"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Masterclass</span>
          </Link>
        </div>
      </div>

      {/* Interactive Course Grid with Hard Deletion Engine */}
      <AdminCoursesClient initialCourses={liveCourses} />
    </div>
  );
}
