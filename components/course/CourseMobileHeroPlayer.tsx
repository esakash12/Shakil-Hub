"use client";

import React from "react";
import { RotateCcw, Clock, BookOpen } from "lucide-react";
import { CourseDetail, getCourseDurationParts } from "@/lib/data/courses";
import CustomVideoPlayer from "@/components/ui/CustomVideoPlayer";
import { useCoursePreview } from "@/components/course/CoursePreviewContext";

interface CourseMobileHeroPlayerProps {
  course: CourseDetail;
  isEnrolled?: boolean;
}

export default function CourseMobileHeroPlayer({
  course,
}: CourseMobileHeroPlayerProps) {
  const {
    activeVideoSrc,
    activePoster,
    activeTitle,
    activeBadge,
    isPlayingPreview,
    resetToTrailer,
  } = useCoursePreview();

  const { hours: hoursVal, minutes: minsVal } = getCourseDurationParts(course);

  // Total lessons count
  const totalLessons =
    course.curriculum?.reduce(
      (acc, mod) => acc + (mod.lessons?.length || mod.lessonsCount || 0),
      0
    ) ||
    parseInt(course.highlights?.lessons) ||
    0;

  return (
    <div className="space-y-3.5 select-none">
      {isPlayingPreview && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/40 to-transparent border border-cyan-500/40 text-xs shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold truncate pr-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="truncate">Preview: {activeTitle}</span>
          </div>
          <button
            type="button"
            onClick={resetToTrailer}
            className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer border border-cyan-500/30"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Trailer</span>
          </button>
        </div>
      )}

      {/* 1. Mobile Top Video Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] bg-zinc-900">
        <CustomVideoPlayer
          key={activeVideoSrc || course.trailerVideo}
          src={activeVideoSrc || course.trailerVideo}
          poster={activePoster || course.thumbnail || course.trailerImage || course.image}
          title={activeTitle || course.title}
          badge={activeBadge || (course.badge ? `${course.badge} Masterclass` : "Masterclass")}
          autoPlay={isPlayingPreview}
        />
      </div>

      {/* 2. Grouped Course Stats (Duration & Lessons) */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        {/* Course Duration Card */}
        <div className="p-3 rounded-xl bg-[#0e1320]/90 border border-cyan-500/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)] backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
            <span>Duration</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-white">
              {hoursVal}h {minsVal}m
            </span>
            <span className="text-[10px] text-cyan-300/70 font-medium">HD Content</span>
          </div>
        </div>

        {/* Total Lessons Card */}
        <div className="p-3 rounded-xl bg-[#0e1320]/90 border border-cyan-500/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)] backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
            <span>Curriculum</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-white">{totalLessons}</span>
            <span className="text-[10px] text-cyan-300/70 font-medium">Lessons</span>
          </div>
        </div>
      </div>
    </div>
  );
}