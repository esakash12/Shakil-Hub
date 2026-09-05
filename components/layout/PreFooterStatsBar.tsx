"use client";

import React, { useState, useEffect } from "react";
import { Users, Video, Layers, Star, Sparkles } from "lucide-react";
import { getLivePlatformStatsAction, LivePlatformStats } from "@/lib/actions/stats";

export default function PreFooterStatsBar() {
  const [liveStats, setLiveStats] = useState<LivePlatformStats>({
    studentsCount: "20K+",
    coursesCount: "50+",
    projectsCount: "10K+",
    ratingValue: "4.9",
    rawStudentsCount: 20000,
    rawCoursesCount: 3,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await getLivePlatformStatsAction();
        if (isMounted && res) {
          setLiveStats(res);
        }
      } catch {}
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      value: liveStats.studentsCount,
      label: "Happy Students",
      icon: Users,
    },
    {
      value: liveStats.coursesCount,
      label: "Premium Courses",
      icon: Video,
    },
    {
      value: liveStats.projectsCount,
      label: "Projects Completed",
      icon: Layers,
    },
    {
      value: liveStats.ratingValue,
      label: "Student Ratings",
      icon: Star,
      isRating: true,
    },
  ];

  return (
    <section
      aria-label="Platform Trust & Statistics"
      className="w-full pt-4 sm:pt-8 pb-4 sm:pb-6 select-none relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Contextual Trust Heading */}
        <div className="text-center max-w-xl mx-auto mb-4 sm:mb-5 space-y-1 sm:space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px] font-semibold tracking-wide shadow-[0_0_12px_rgba(6,182,212,0.12)]">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Global Creative Community</span>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">
            Trusted by Creative Professionals Worldwide
          </h3>
          <p className="text-xs sm:text-[13px] text-zinc-400 font-normal max-w-md mx-auto leading-relaxed">
            Join thousands of editors mastering high-end filmmaking, VFX, and commercial color grading.
          </p>
        </div>

        {/* Shrunk, Compact Stats Bar Container */}
        <div className="rounded-xl bg-[#0e1320]/75 border border-white/10 hover:border-cyan-500/25 backdrop-blur-xl p-2 sm:p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-2.5 py-1.5 px-2 sm:py-2 sm:px-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all shadow-sm"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <stat.icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      stat.isRating ? "text-amber-400 fill-amber-400" : "text-cyan-400"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm lg:text-[15px] font-bold text-white tracking-tight flex items-center gap-1">
                    {stat.value}
                    {stat.isRating && (
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400 ml-0.5 inline-block" />
                    )}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-400 font-medium truncate">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
