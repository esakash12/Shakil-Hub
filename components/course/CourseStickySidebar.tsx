"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Play,
  Heart,
  Clock,
  Loader2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  BarChart,
  ShieldCheck,
  Award,
} from "lucide-react";
import { CourseDetail, getCourseDurationParts, getFirstLessonId } from "@/lib/data/courses";
import { toggleWishlistCourseAction } from "@/lib/actions/wishlist";
import CustomVideoPlayer from "@/components/ui/CustomVideoPlayer";
import { useCoursePreview } from "@/components/course/CoursePreviewContext";

interface CourseStickySidebarProps {
  initialCourse?: CourseDetail;
  slug?: string;
  isEnrolled?: boolean;
  isPending?: boolean;
}

export default function CourseStickySidebar({
  initialCourse,
  slug = "",
  isEnrolled: initialIsEnrolled = false,
  isPending: initialIsPending = false,
}: CourseStickySidebarProps) {
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | undefined>(initialCourse);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [isPending, setIsPending] = useState(initialIsPending);

  const {
    activeVideoSrc,
    activePoster,
    activeTitle,
    activeBadge,
    isPlayingPreview,
    resetToTrailer,
  } = useCoursePreview();

  useEffect(() => {
    if (initialCourse) {
      setCourse(initialCourse);
    }
  }, [initialCourse?.slug, initialCourse?.title, initialCourse?.price]);

  useEffect(() => {
    setIsEnrolled(Boolean(initialIsEnrolled));
  }, [initialIsEnrolled]);

  useEffect(() => {
    setIsPending(Boolean(initialIsPending));
  }, [initialIsPending]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sakil_wishlist_${slug}`);
      if (saved === "true") setIsWishlisted(true);
    } catch {}
  }, [slug]);

  const handleToggleWishlist = async () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    try {
      localStorage.setItem(`sakil_wishlist_${slug}`, nextState ? "true" : "false");
      await toggleWishlistCourseAction(slug);
    } catch {}
  };

  const firstLessonId = getFirstLessonId(course);

  const handleAction = () => {
    if (isEnrolled) {
      if (firstLessonId) {
        router.push(`/learn/${slug}/${firstLessonId}`);
      } else {
        router.push(`/courses/${slug}#curriculum`);
      }
    } else if (isPending) {
      router.push("/dashboard/pending");
    } else {
      setIsEnrolling(true);
      router.push(`/checkout/${slug}`);
    }
  };

  if (!course) return null;

  // 100% Dynamic calculation directly from curriculum database lessons
  const { hours: hoursVal, minutes: minsVal } = getCourseDurationParts(course);

  return (
    <div className="relative group lg:sticky lg:top-24 h-fit select-none">
      {/* 0. Soft Neon Cyan Ambient Glow Backdrop (Gives depth without overpowering) */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-b from-cyan-500/20 via-blue-600/10 to-transparent blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none -z-10" />

      {/* Main Glassmorphic Sticky Card Container */}
      <div className="space-y-2.5 rounded-2xl bg-[#0e1320]/95 border border-cyan-500/25 hover:border-cyan-500/40 p-3.5 sm:p-4 shadow-[0_15px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-colors duration-300">
        {/* 1. The CustomVideoPlayer (Desktop Only in Sidebar - Mobile rendered at top of page) */}
        <div className="hidden lg:block space-y-1">
          {isPlayingPreview && (
            <div className="flex items-center justify-between px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-cyan-950/80 via-blue-950/40 to-transparent border border-cyan-500/40 text-xs shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate pr-2 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span className="truncate">Preview: {activeTitle}</span>
              </div>
              <button
                type="button"
                onClick={resetToTrailer}
                className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer border border-cyan-500/30"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Trailer</span>
              </button>
            </div>
          )}

          <div
            id="course-theater-player"
            className="relative w-full aspect-video rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-zinc-900"
          >
            <CustomVideoPlayer
              key={activeVideoSrc || course.trailerVideo}
              src={activeVideoSrc || course.trailerVideo}
              poster={activePoster || course.thumbnail || course.trailerImage || course.image}
              title={activeTitle || course.title}
              badge={activeBadge || (course.badge ? `${course.badge} Masterclass` : "Masterclass")}
              autoPlay={isPlayingPreview}
            />
          </div>
        </div>

        {/* 2. Sleek Compact Course Duration & Lessons Box (Scaled Down) */}
        <div className="rounded-xl bg-black/50 border border-cyan-500/15 p-1.5 text-center space-y-0.5 shadow-inner">
          <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 font-semibold">
            <Clock className="w-3 h-3 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
            <span>Course Duration</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="py-0.5 px-2 rounded-lg bg-white/[0.02] border border-cyan-500/10 hover:border-cyan-500/30 transition-colors flex items-center justify-center gap-1">
              <span className="text-sm font-black text-white">{hoursVal}</span>
              <span className="text-[9px] text-cyan-300/70 uppercase tracking-wider font-semibold">
                Hours
              </span>
            </div>
            <div className="py-0.5 px-2 rounded-lg bg-white/[0.02] border border-cyan-500/10 hover:border-cyan-500/30 transition-colors flex items-center justify-center gap-1">
              <span className="text-sm font-black text-white">{minsVal}</span>
              <span className="text-[9px] text-cyan-300/70 uppercase tracking-wider font-semibold">
                Min
              </span>
            </div>
          </div>
        </div>

        {/* 3. Scaled-Down Sleek Price & Discount Header */}
        <div className="space-y-0.5">
          {!isEnrolled && !isPending ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                  {course.price}
                </span>
                <span className="text-xs text-gray-500 line-through font-medium">
                  {course.originalPrice}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  {course.discountPct}
                </span>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                <span>Special promotional lifetime access</span>
              </p>
            </div>
          ) : isPending ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                <span>Enrollment Pending Verification</span>
              </div>
              <p className="text-[9px] text-amber-400/70">
                Order submitted. Awaiting manual payment approval.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>You own this masterclass</span>
            </div>
          )}

          {/* Learners Joined Stack */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex -space-x-1 overflow-hidden">
              <div className="inline-block h-4 w-4 rounded-full ring-1.5 ring-zinc-950 bg-cyan-500 text-[8px] font-bold text-black flex items-center justify-center">
                S
              </div>
              <div className="inline-block h-4 w-4 rounded-full ring-1.5 ring-zinc-950 bg-teal-500 text-[8px] font-bold text-black flex items-center justify-center">
                A
              </div>
              <div className="inline-block h-4 w-4 rounded-full ring-1.5 ring-zinc-950 bg-blue-500 text-[8px] font-bold text-white flex items-center justify-center">
                K
              </div>
            </div>
            <span className="text-[10px] text-gray-300 font-medium">
              {course.studentsCount || "31 Learners Joined"}
            </span>
          </div>
        </div>

        {/* 4. Action CTA Buttons (Above the Fold) */}
        <div className="space-y-1.5 pt-0.5">
          <button
            type="button"
            onClick={handleAction}
            disabled={isEnrolling}
            className={`w-full py-2.5 rounded-xl border font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
              isEnrolled
                ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                : isPending
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                : "bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black border-cyan-200/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.65)] hover:scale-[1.01]"
            }`}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Preparing Checkout...</span>
              </>
            ) : isEnrolled ? (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Continue Learning</span>
              </>
            ) : isPending ? (
              <>
                <Clock className="w-3.5 h-3.5 text-black animate-pulse" />
                <span>View Pending Order →</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Enroll Now {course.price}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`w-full py-1.5 rounded-xl border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
              isWishlisted
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-white/[0.04] border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-200"
            }`}
          >
            <Heart
              className={`w-3 h-3 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
          </button>
        </div>

        {/* 5. Feature List (This Course Includes) */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>This Course Includes:</span>
          </h4>

          <ul className="space-y-2 text-xs text-gray-300 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">»</span>
              <span>{course.highlights.hours} of on-demand practical HD video</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">»</span>
              <span>{course.highlights.lessons} detailed lessons & downloadable project files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">»</span>
              <span>Full lifetime access & free future updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">»</span>
              <span>Official verified certificate of completion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">»</span>
              <span>Direct instructor Q&A desk support</span>
            </li>
          </ul>
        </div>

        {/* 6. Course Info Badges (Level, Type) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/10">
          <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/10 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
              <BarChart className="w-3.5 h-3.5" />
              <span>Level</span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {course.level || "Beginner to Pro"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/10 space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Access</span>
            </div>
            <p className="text-xs font-bold text-white">Lifetime Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}