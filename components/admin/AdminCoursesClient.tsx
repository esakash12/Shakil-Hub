"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Plus,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { CourseDetail } from "@/lib/data/courses";
import { deleteMasterclassAction } from "@/lib/actions/admin-courses";

interface AdminCoursesClientProps {
  initialCourses: CourseDetail[];
}

export default function AdminCoursesClient({
  initialCourses = [],
}: AdminCoursesClientProps) {
  const [courses, setCourses] = useState<CourseDetail[]>(initialCourses);
  const [deleteModalCourse, setDeleteModalCourse] = useState<CourseDetail | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenDeleteModal = (course: CourseDetail) => {
    setDeleteModalCourse(course);
    setDeleteConfirmText("");
    setErrorMsg("");
  };

  const handleExecuteDelete = async () => {
    if (!deleteModalCourse) return;
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const res = await deleteMasterclassAction(deleteModalCourse.slug);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.slug !== deleteModalCourse.slug));
        setDeleteModalCourse(null);
      } else {
        setErrorMsg(res.error || "Failed to delete masterclass.");
      }
    } catch {
      setErrorMsg("Network error while deleting masterclass.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Course Grid / Empty State */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 sm:p-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-white tracking-tight">
              No Masterclasses in Database
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              Your database has been wiped clean. Click below to publish your first 100% digital video editing masterclass.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin/courses/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create First Masterclass</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.slug}
              className="rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 shadow-inner">
                        <GraduationCap className="w-5 h-5" />
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
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold backdrop-blur-md">
                    Published
                  </span>
                </div>

                {/* Course Info */}
                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-400 block">
                      Instructor: {course.instructor.name}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{course.highlights.hours}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{course.studentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="font-mono text-base font-bold text-white">
                  {course.price}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    title="View on Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/admin/courses/${course.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(course)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                    title="Permanently wipe masterclass"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STRICT COURSE DELETE CONFIRMATION MODAL */}
      {deleteModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1017] border border-red-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Masterclass?</h3>
                <p className="text-xs text-red-300/80">Hard Database Wipe</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-gray-300 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Course Title:</span>
                <span className="text-white font-bold">{deleteModalCourse.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Slug:</span>
                <span className="text-cyan-400">{deleteModalCourse.slug}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              This action will completely erase <strong className="text-white">&ldquo;{deleteModalCourse.title}&rdquo;</strong> from the Medusa database, storefront catalog, and revoke it from all student dashboards.
            </p>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400">
                Type <strong className="text-red-400 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalCourse(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting || deleteConfirmText.trim() !== "DELETE"}
                onClick={handleExecuteDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Wiping Course...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Wipe Masterclass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
