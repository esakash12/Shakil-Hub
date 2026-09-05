"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Zap, Loader2, Play, CheckCircle2 } from "lucide-react";
import { getCourseBySlug, getFirstLessonId, CourseDetail } from "@/lib/data/courses";

interface StickyBottomCTAProps {
  initialCourse?: CourseDetail;
  slug?: string;
  isEnrolled?: boolean;
}

export default function StickyBottomCTA({
  initialCourse,
  slug: propSlug,
  isEnrolled: initialIsEnrolled = false,
}: StickyBottomCTAProps = {}) {
  const params = useParams();
  const router = useRouter();
  const slug = propSlug || (params?.slug as string) || "";

  const [course, setCourse] = useState<CourseDetail>(() => initialCourse || (slug ? getCourseBySlug(slug) : ({} as CourseDetail)));
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);

  useEffect(() => {
    if (initialCourse) {
      setCourse(initialCourse);
    }
  }, [initialCourse?.slug, initialCourse?.title, initialCourse?.price]);

  useEffect(() => {
    setIsEnrolled(Boolean(initialIsEnrolled));
  }, [initialIsEnrolled]);

  const firstLessonId = getFirstLessonId(course);

  const handleAction = () => {
    if (isEnrolled) {
      if (firstLessonId) {
        router.push(`/learn/${course.slug}/${firstLessonId}`);
      } else {
        router.push(`/courses/${course.slug}#curriculum`);
      }
    } else {
      setIsEnrolling(true);
      router.push(`/checkout/${course.slug}`);
    }
  };

  return (
    <div
      aria-label="Mobile Sticky Checkout Bar"
      className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 lg:hidden bg-[#07090e]/95 backdrop-blur-2xl border-t border-cyan-500/25 py-2.5 px-4 sm:px-6 shadow-[0_-10px_35px_rgba(0,0,0,0.95)] select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Side: Price & Discount or Enrolled Badge */}
        <div className="flex flex-col justify-center">
          {!isEnrolled ? (
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {course.price}
                </span>
                <span className="text-xs text-gray-500 line-through font-medium">
                  {course.originalPrice}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-bold text-cyan-300">
                  {course.discountPct}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Lifetime Access</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Enrolled Access</span>
            </div>
          )}
        </div>

        {/* Right Side: High-Energy Neon Cyan CTA Button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleAction}
            disabled={isEnrolling}
            className={`px-5 sm:px-7 py-3 rounded-xl border text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.45)] active:scale-95 transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
              isEnrolled
                ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 border-cyan-200/60 shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            }`}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Preparing...</span>
              </>
            ) : isEnrolled ? (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>Continue</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-black" />
                <span>Enroll Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
