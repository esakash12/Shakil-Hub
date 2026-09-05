"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Accordion, { SectionItem } from "@/components/ui/Accordion";
import { getCourseBySlug, CourseDetail, formatTotalDuration } from "@/lib/data/courses";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { Play, Sparkles, Loader2, BookOpen } from "lucide-react";

interface CourseCurriculumProps {
  initialCourse?: CourseDetail;
  slug?: string;
}

export default function CourseCurriculum({ initialCourse, slug: propSlug }: CourseCurriculumProps = {}) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string) || "premiere-pro-masterclass";

  const [course, setCourse] = useState<CourseDetail>(() => initialCourse || getCourseBySlug(slug));
  const [isLoading, setIsLoading] = useState(!initialCourse);

  useEffect(() => {
    if (initialCourse) {
      setCourse(initialCourse);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadLiveCurriculum() {
      setIsLoading(true);
      try {
        const res = await getLiveCourseAction(slug);
        if (isMounted && res.success && res.course) {
          setCourse(res.course);
        }
      } catch (err) {
        console.error("Failed to load live course curriculum:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLiveCurriculum();

    return () => {
      isMounted = false;
    };
  }, [slug, initialCourse]);

  // Robust parsing of curriculum array
  const rawCurriculum = course?.curriculum;
  const parsedCurriculum =
    typeof rawCurriculum === "string"
      ? (() => {
          try {
            return JSON.parse(rawCurriculum);
          } catch {
            return [];
          }
        })()
      : Array.isArray(rawCurriculum)
      ? rawCurriculum
      : [];

  const curriculumSections: SectionItem[] = parsedCurriculum.map((m: any, idx: number) => {
    const rawLessons = typeof m.lessons === "string" ? JSON.parse(m.lessons) : m.lessons;
    const lessonsList = Array.isArray(rawLessons) ? rawLessons : [];

    return {
      id: m.id || `mod-${idx + 1}`,
      title: m.title || `Module ${idx + 1}`,
      lessonCount: lessonsList.length,
      duration: formatTotalDuration(lessonsList),
      lessons: lessonsList.map((l: any, lIdx: number) => ({
        id: l.id || `${idx + 1}-${lIdx + 1}`,
        title: l.title || `Lesson ${lIdx + 1}`,
        duration: l.duration || "10:00",
        isPreview: Boolean(l.isPreview || l.isFreePreview),
        isFreePreview: Boolean(l.isPreview || l.isFreePreview),
        r2_object_key: l.r2_object_key || l.r2Key || "",
        r2Key: l.r2_object_key || l.r2Key || "",
        videoUrl: l.videoUrl || "",
        attachmentUrl: l.attachmentUrl || "",
      })),
    };
  });

  const totalLessons = curriculumSections.reduce(
    (acc, sec) => acc + sec.lessonCount,
    0
  );

  return (
    <div id="curriculum" className="space-y-3 sm:space-y-5 select-none scroll-mt-28">
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1">
            Course Curriculum
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {curriculumSections.length > 0
              ? `${curriculumSections.length} modules • ${totalLessons} lessons`
              : "Explore the lecture breakdown and preview available sample lessons."}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing live curriculum...</span>
          </div>
        )}
      </div>

      {/* Dynamic Curriculum Accordion */}
      {!isLoading && curriculumSections.length > 0 && (
        <Accordion sections={curriculumSections} defaultExpandedIndex={0} />
      )}

      {/* Fallback only when load complete and genuinely empty */}
      {!isLoading && curriculumSections.length === 0 && (
        <div className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Curriculum Under Construction
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              The lead instructor is currently structuring the syllabus and uploading HD masterclass lessons.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
