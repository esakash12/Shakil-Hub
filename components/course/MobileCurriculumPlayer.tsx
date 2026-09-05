"use client";

import React from "react";
import { RotateCcw, PlaySquare, Sparkles } from "lucide-react";
import { CourseDetail } from "@/lib/data/courses";
import CustomVideoPlayer from "@/components/ui/CustomVideoPlayer";
import { useCoursePreview } from "@/components/course/CoursePreviewContext";

interface MobileCurriculumPlayerProps {
  course: CourseDetail;
}

export default function MobileCurriculumPlayer({
  course,
}: MobileCurriculumPlayerProps) {
  const {
    activeVideoSrc,
    activePoster,
    activeTitle,
    activeBadge,
    isPlayingPreview,
    resetToTrailer,
  } = useCoursePreview();

  return (
    <div id="curriculum-preview-player" className="space-y-2.5 select-none scroll-mt-20">
      {/* 2nd Player Section Label */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <PlaySquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Curriculum Preview Player</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-400/30">
                2nd Player
              </span>
            </h3>
          </div>
        </div>

        {isPlayingPreview ? (
          <button
            type="button"
            onClick={resetToTrailer}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-cyan-500/30"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        ) : (
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>Plays Free Previews</span>
          </span>
        )}
      </div>

      {/* Active Preview Banner (when playing preview from curriculum) */}
      {isPlayingPreview && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/90 via-blue-950/50 to-transparent border border-cyan-500/40 text-xs shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold truncate pr-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="truncate">Playing Preview: {activeTitle}</span>
          </div>
        </div>
      )}

      {/* 2nd Video Player Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.18)] bg-zinc-900">
        <CustomVideoPlayer
          key={activeVideoSrc || course.trailerVideo}
          src={activeVideoSrc || course.trailerVideo}
          poster={activePoster || course.thumbnail || course.trailerImage || course.image}
          title={activeTitle || `${course.title} — Preview`}
          badge={activeBadge || (course.badge ? `${course.badge} Masterclass` : "Masterclass")}
          autoPlay={isPlayingPreview}
        />
      </div>

      {/* Instructional Hint */}
      {!isPlayingPreview && (
        <p className="text-[11px] text-gray-400 px-1 italic">
          Tip: Tap any &quot;Free Preview&quot; lesson in the curriculum below to watch it play right here.
        </p>
      )}
    </div>
  );
}