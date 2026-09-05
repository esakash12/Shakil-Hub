"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, PlayCircle, Lock, Eye, X, Sparkles, Play } from "lucide-react";
import SecureVideoPlayer from "@/components/storefront/SecureVideoPlayer";
import { useCoursePreview } from "@/components/course/CoursePreviewContext";

export interface LessonItem {
  id: string;
  title: string;
  duration: string;
  isPreview?: boolean;
  isFreePreview?: boolean;
  r2_object_key?: string;
  r2Key?: string;
  videoUrl?: string;
  attachmentUrl?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  lessonCount: number;
  duration: string;
  lessons: LessonItem[];
}

interface AccordionProps {
  sections: SectionItem[];
  defaultExpandedIndex?: number;
}

export default function Accordion({
  sections,
  defaultExpandedIndex = 0,
}: AccordionProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [sections[defaultExpandedIndex]?.id || ""]: true,
  });

  const [activePreviewLessonId, setActivePreviewLessonId] = useState<string | null>(null);

  // Safely hook into Theater Mode Course Preview Context
  let previewContext: any = null;
  try {
    previewContext = useCoursePreview();
  } catch {
    previewContext = null;
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sections.forEach((s) => (all[s.id] = true));
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const areAllExpanded = sections.every((s) => expandedSections[s.id]);

  const handleLessonPreviewClick = (lesson: LessonItem) => {
    const videoSrc = lesson.r2_object_key || lesson.r2Key || lesson.videoUrl || "";
    if (previewContext && videoSrc) {
      previewContext.playPreview({
        src: videoSrc,
        title: lesson.title,
        badge: "Free Preview Lesson",
      });
    } else {
      setActivePreviewLessonId((prev) => (prev === lesson.id ? null : lesson.id));
    }
  };

  return (
    <div className="space-y-3">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs sm:text-sm text-gray-400 font-medium">
          {sections.reduce((acc, s) => acc + s.lessonCount, 0)} Lessons •{" "}
          {sections.reduce((acc, s) => {
            const hrs = parseInt(s.duration) || 2;
            return acc + hrs;
          }, 0)}{" "}
          Hours Content
        </span>
        <button
          type="button"
          onClick={areAllExpanded ? collapseAll : expandAll}
          className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
        >
          {areAllExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Accordion list */}
      <div className="space-y-2.5">
        {sections.map((section, index) => {
          const isOpen = !!expandedSections[section.id];

          return (
            <div
              key={section.id}
              className="rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
            >
              {/* Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 sm:hidden">
                      {section.lessonCount} lessons • {section.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="hidden sm:inline-block text-xs text-gray-400">
                    {section.lessonCount} lessons • {section.duration}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 group-hover:text-white transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-white/5 bg-black/40"
                  >
                    <div className="divide-y divide-white/5">
                      {section.lessons.map((lesson, lIndex) => {
                        const isPreviewable =
                          lesson.isPreview || lesson.isFreePreview;
                        const isPlayingInTheater =
                          Boolean(previewContext?.isPlayingPreview && previewContext?.activeTitle === lesson.title);
                        const isPreviewOpen = activePreviewLessonId === lesson.id;

                        return (
                          <div key={lesson.id} className="flex flex-col">
                            <div
                              className={`px-4 sm:px-6 py-3 flex items-center justify-between text-xs transition-colors ${
                                isPreviewable
                                  ? "hover:bg-blue-500/[0.05] cursor-pointer"
                                  : "hover:bg-white/[0.02]"
                              } ${isPlayingInTheater || isPreviewOpen ? "bg-blue-500/[0.08]" : ""}`}
                              onClick={() => {
                                if (isPreviewable) {
                                  handleLessonPreviewClick(lesson);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pr-2">
                                <PlayCircle
                                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                                    isPreviewable
                                      ? isPlayingInTheater
                                        ? "text-cyan-400 animate-pulse"
                                        : "text-blue-400"
                                      : "text-gray-500"
                                  }`}
                                />
                                <span
                                  className={`font-medium truncate ${
                                    isPlayingInTheater
                                      ? "text-cyan-300 font-bold"
                                      : isPreviewable
                                      ? "text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {lIndex + 1}. {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                {isPreviewable ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLessonPreviewClick(lesson);
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-semibold transition-all cursor-pointer ${
                                      isPlayingInTheater
                                        ? "bg-cyan-400 text-black border-cyan-300 font-black shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                                        : "bg-cyan-500/10 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300 hover:text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                                    }`}
                                  >
                                    {isPlayingInTheater ? (
                                      <>
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                        <span>Playing in Theater</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-2.5 h-2.5 text-cyan-400" />
                                        <span>Free Preview</span>
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <Lock className="w-3 h-3 text-gray-600" />
                                )}
                                <span className="text-[11px] text-gray-500 font-mono">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>

                            {/* Fallback INLINE Player only when not in Theater Mode context */}
                            <AnimatePresence>
                              {!previewContext && isPreviewable && isPreviewOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden bg-black/80 border-t border-b border-blue-500/20 p-3.5 sm:p-5 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" />
                                        Free Preview
                                      </span>
                                      <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                                        {lesson.title}
                                      </h4>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setActivePreviewLessonId(null)}
                                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>Close</span>
                                    </button>
                                  </div>

                                  <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                    <SecureVideoPlayer
                                      videoKey={
                                        lesson.r2_object_key ||
                                        lesson.r2Key ||
                                        lesson.videoUrl ||
                                        ""
                                      }
                                      title={lesson.title}
                                      badge="Free Lesson Preview"
                                      autoPlay={true}
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}