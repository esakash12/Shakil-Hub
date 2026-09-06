"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Zap,
  Play,
  Heart,
  Loader2,
  Award,
  BarChart,
  ShieldCheck,
} from "lucide-react";
import { CourseDetail, getCourseDurationParts, getFirstLessonId } from "@/lib/data/courses";
import { toggleWishlistCourseAction } from "@/lib/actions/wishlist";

interface MobileQuickStatsAndFeaturesProps {
  course: CourseDetail;
  slug?: string;
  isEnrolled?: boolean;
  isPending?: boolean;
}

export default function MobileQuickStatsAndFeatures({
  course,
  slug = "",
  isEnrolled: initialIsEnrolled = false,
  isPending: initialIsPending = false,
}: MobileQuickStatsAndFeaturesProps) {
  const router = useRouter();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [isPending, setIsPending] = useState(initialIsPending);

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

  const { hours: hoursVal, minutes: minsVal } = getCourseDurationParts(course);

  const totalLessons =
    course.curriculum?.reduce(
      (acc, mod) => acc + (mod.lessons?.length || mod.lessonsCount || 0),
      0
    ) ||
    parseInt(course.highlights?.lessons) ||
    0;

  return (
    <div className="space-y-4 rounded-2xl bg-[#0e1320]/95 border border-cyan-500/25 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-2xl select-none">
      {/* 1. Price & Discount Header */}
      <div className="space-y-1.5">
        {!isEnrolled && !isPending ? (
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                {course.price}
              </span>
              <span className="text-sm text-gray-500 line-through font-medium">
                {course.originalPrice}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {course.discountPct}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Special promotional lifetime access</span>
            </p>
          </div>
        ) : isPending ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span>Enrollment Pending Verification</span>
            </div>
            <p className="text-xs text-amber-400/70">
              Your order is awaiting manual payment confirmation by admin.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>You own this masterclass</span>
          </div>
        )}

        {/* Learners Joined Avatar Row */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-950 bg-cyan-500 text-[10px] font-bold text-black flex items-center justify-center">
              S
            </div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-950 bg-teal-500 text-[10px] font-bold text-black flex items-center justify-center">
              A
            </div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-950 bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
              K
            </div>
          </div>
          <span className="text-xs text-gray-300 font-medium">
            {course.studentsCount || "31 Learners Joined"}
          </span>
        </div>
      </div>

      {/* 2. Course Duration & Lessons Quick Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/15 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
            <span>Duration</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-white">
              {hoursVal}h {minsVal}m
            </span>
            <span className="text-[10px] text-cyan-300/70 font-medium">HD</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/15 space-y-1">
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

      {/* 3. CTA Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={handleAction}
          disabled={isEnrolling}
          className={`w-full py-3 rounded-xl border font-black text-sm flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
            isEnrolled
              ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              : isPending
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              : "bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black border-cyan-200/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.01]"
          }`}
        >
          {isEnrolling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Preparing Checkout...</span>
            </>
          ) : isEnrolled ? (
            <>
              <Play className="w-4 h-4 fill-black" />
              <span>Continue Learning</span>
            </>
          ) : isPending ? (
            <>
              <Clock className="w-4 h-4 text-black animate-pulse" />
              <span>View Pending Order →</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-black" />
              <span>Enroll Now {course.price}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-white/[0.04] border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-200"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isWishlisted ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
        </button>
      </div>

      {/* 4. Feature List (This Course Includes) */}
      <div className="border-t border-white/10 pt-3.5 space-y-2.5">
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

      {/* 5. Course Info Badges (Level, Access) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/10">
        <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/10 space-y-0.5">
          <div className="flex items-center gap-1 text-cyan-400 text-[11px] font-semibold">
            <BarChart className="w-3 h-3" />
            <span>Level</span>
          </div>
          <p className="text-xs font-bold text-white truncate">
            {course.level || "Beginner to Pro"}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/10 space-y-0.5">
          <div className="flex items-center gap-1 text-teal-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>Access</span>
          </div>
          <p className="text-xs font-bold text-white">Lifetime Access</p>
        </div>
      </div>
    </div>
  );
}