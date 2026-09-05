"use client";

import React from "react";
import { CourseDetail } from "@/lib/data/courses";
import CustomVideoPlayer from "@/components/ui/CustomVideoPlayer";
import { Film } from "lucide-react";

interface MobileHeroTrailerPlayerProps {
  course: CourseDetail;
  isEnrolled?: boolean;
}

export default function MobileHeroTrailerPlayer({
  course,
}: MobileHeroTrailerPlayerProps) {
  const trailerSrc = course.trailerVideo || "";
  const trailerPoster =
    course.thumbnail || course.trailerImage || course.image || "";
  const trailerTitle = `${course.title} — Official Trailer`;
  const trailerBadge = course.badge ? `${course.badge} Trailer` : "Official Trailer";

  return (
    <div id="mobile-hero-trailer-player" className="space-y-2 select-none">
      {/* Header Tag */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
          <Film className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          <span>Course Trailer</span>
        </span>
        <span className="text-gray-400 text-[10px]">Tap to Watch</span>
      </div>

      {/* Main Top Trailer Player Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] bg-zinc-900">
        <CustomVideoPlayer
          src={trailerSrc}
          poster={trailerPoster}
          title={trailerTitle}
          badge={trailerBadge}
          autoPlay={false}
        />
      </div>
    </div>
  );
}