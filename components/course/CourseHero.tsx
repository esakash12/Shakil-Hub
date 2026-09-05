"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Zap,
  Play,
  Heart,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { getCourseBySlug, getFirstLessonId, CourseDetail } from "@/lib/data/courses";
import { toggleWishlistCourseAction } from "@/lib/actions/wishlist";
import CustomVideoPlayer from "@/components/ui/CustomVideoPlayer";
import { useCoursePreview } from "@/components/course/CoursePreviewContext";

interface CourseHeroProps {
  initialCourse?: CourseDetail;
  slug?: string;
  isEnrolled?: boolean;
}

export default function CourseHero({
  initialCourse,
  slug: propSlug,
  isEnrolled: initialIsEnrolled = false,
}: CourseHeroProps = {}) {
  const params = useParams();
  const router = useRouter();
  const slug = propSlug || (params?.slug as string) || "premiere-pro-masterclass";

  const [course, setCourse] = useState<CourseDetail>(() => initialCourse || getCourseBySlug(slug));
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    <section className="relative w-full bg-black text-white border-b border-white/10 select-none overflow-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Main Container: Flex Layout for Desktop */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 py-12">
        {/* Left Column (Content, ~60% width): Strict Left Alignment, flex-col gap-5 */}
        <div className="w-full lg:w-[58%] flex flex-col gap-5 text-left">
          {/* 1. Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/courses" className="hover:text-white transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-blue-400 font-medium truncate max-w-xs">
              {course.title}
            </span>
          </nav>

          {/* 2. Status / Masterclass Badge */}
          <div className="w-fit">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              {isEnrolled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Enrolled Student Access</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{course.badge || "Featured"} Masterclass</span>
                </>
              )}
            </div>
          </div>

          {/* 3. Massive Course Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            {course.title}
          </h1>

          {/* 4. Short Description / Subtitle */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal max-w-2xl">
            {course.subtitle || course.description}
          </p>

          {/* 5. Ratings & Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md text-white font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{course.rating}</span>
              <span className="text-gray-400 font-normal">
                ({course.studentsCount || "0 Enrolled"})
              </span>
            </div>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="text-gray-300 font-medium">By {course.instructor.name}</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="text-gray-400">Updated: {course.updatedDate}</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="text-cyan-400 font-medium">{course.level || "Beginner to Pro"}</span>
          </div>

          {/* 6. Action Buttons (Continue/Enroll, Wishlist, Share) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleAction}
              disabled={isEnrolling}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${
                isEnrolled
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-500/25"
              }`}
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Preparing Checkout...</span>
                </>
              ) : isEnrolled ? (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Learning</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Enroll Now {course.price}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                isWishlisted
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-gray-300 hover:text-white"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (Media, ~40% width): Strict 16:9 Aspect Ratio with Premium Rounded Frame */}
        <div className="w-full lg:w-[42%] shrink-0 space-y-2">
          {isPlayingPreview && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-transparent border border-blue-500/30 text-xs shadow-[0_0_15px_rgba(37,99,235,0.1)]"
            >
              <div className="flex items-center gap-2 text-cyan-300 font-semibold truncate pr-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                <span className="truncate">Preview: {activeTitle}</span>
              </div>
              <button
                type="button"
                onClick={resetToTrailer}
                className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Trailer</span>
              </button>
            </motion.div>
          )}

          <div
            id="course-theater-player"
            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 transition-all duration-300"
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
      </div>
    </section>
  );
}
