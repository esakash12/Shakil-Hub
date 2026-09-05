"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import {
  getCourseBySlug,
  CourseModule,
  CourseLesson,
  formatTotalDuration,
} from "@/lib/data/courses";
import { getCourseProgressAction } from "@/lib/actions/progress";

interface CourseCurriculumSidebarProps {
  activeLessonId?: string;
  courseSlug?: string;
  curriculum?: CourseModule[];
}

export default function CourseCurriculumSidebar({
  activeLessonId = "",
  courseSlug = "",
  curriculum,
}: CourseCurriculumSidebarProps) {
  const activeCurriculum: CourseModule[] =
    curriculum && curriculum.length > 0
      ? curriculum
      : [];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Load persistent course progress & listen for real-time completion updates
  useEffect(() => {
    let isMounted = true;
    async function loadProgress() {
      try {
        const res = await getCourseProgressAction(courseSlug);
        if (isMounted && res) {
          setCompletedLessonIds(res.completedLessonIds || []);
        }
      } catch (err) {
        console.error("Failed to load sidebar progress:", err);
      }
    }
    loadProgress();

    const handleProgressEvent = (e: Event) => {
      loadProgress();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sakil:progress-updated", handleProgressEvent);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("sakil:progress-updated", handleProgressEvent);
      }
    };
  }, [courseSlug, activeLessonId]);

  // Find module containing active lesson to auto-expand
  useEffect(() => {
    if (activeCurriculum.length > 0) {
      const initialMap: Record<string, boolean> = {};
      let matched = false;

      activeCurriculum.forEach((section: CourseModule) => {
        const containsActive = section.lessons?.some((l: CourseLesson) => l.id === activeLessonId);
        if (containsActive) {
          initialMap[section.id] = true;
          matched = true;
        }
      });

      // Default expand first section if no match
      if (!matched && activeCurriculum[0]) {
        initialMap[activeCurriculum[0].id] = true;
      }

      setExpandedSections((prev) => ({ ...initialMap, ...prev }));
    }
  }, [activeLessonId, activeCurriculum]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allLessons: CourseLesson[] = activeCurriculum.flatMap((m: CourseModule) => m.lessons || []);
  const totalLessons = allLessons.length || 24;
  const completedCount = completedLessonIds.length;
  const progressPct =
    totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  return (
    <aside className="w-full rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden flex flex-col h-full backdrop-blur-xl select-none">
      {/* Sidebar Header with Progress */}
      <div className="p-4 sm:p-5 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Course Playlist</span>
          </h3>
          <span className="text-xs font-mono font-semibold text-blue-400">
            {progressPct}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400">
          {completedCount} of {totalLessons} lessons completed
        </p>
      </div>

      {/* Scrollable Curriculum List */}
      <div className="overflow-y-auto max-h-[550px] lg:max-h-[calc(100vh-220px)] divide-y divide-white/5">
        {activeCurriculum.map((section: CourseModule) => {
          const isOpen = !!expandedSections[section.id];
          const hasActiveLesson = section.lessons?.some((l: CourseLesson) => l.id === activeLessonId);

          return (
            <div key={section.id} className="bg-transparent">
              {/* Section Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  hasActiveLesson
                    ? "bg-blue-600/10 text-white"
                    : "hover:bg-white/[0.02] text-gray-300"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">
                    {section.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {section.lessons?.length || 0} lessons • {formatTotalDuration(section.lessons || [])}
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-blue-400" : ""
                  }`}
                />
              </button>

              {/* Lessons list */}
              {isOpen && (
                <div className="py-1 bg-black/40 divide-y divide-white/[0.03]">
                  {section.lessons?.map((lesson: CourseLesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessonIds.includes(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${courseSlug}/${lesson.id}`}
                        className={`px-4 py-2.5 flex items-center justify-between text-xs transition-all ${
                          isActive
                            ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 font-semibold shadow-inner"
                            : "hover:bg-white/[0.02] text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isActive ? (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          )}

                          <span className="truncate text-xs">
                            {lesson.title}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {lesson.duration || "10:00"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
