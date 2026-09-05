"use client";

import React, { useState, useEffect, useCallback } from "react";
import SecureVideoPlayer from "@/components/storefront/SecureVideoPlayer";
import LessonInfoTabs from "@/components/learn/LessonInfoTabs";
import {
  getCourseProgressAction,
  toggleLessonCompletionAction,
  markLessonCompletedAction,
} from "@/lib/actions/progress";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface ClassroomPlayerContainerProps {
  videoKey: string;
  currentLessonTitle: string;
  poster?: string;
  courseSlug: string;
  lessonId: string;
  moduleTitle?: string;
  duration?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  prevLessonId?: string;
  nextLessonId?: string;
}

export default function ClassroomPlayerContainer({
  videoKey,
  currentLessonTitle,
  poster,
  courseSlug,
  lessonId,
  moduleTitle,
  duration,
  attachmentUrl,
  attachmentName,
  prevLessonId,
  nextLessonId,
}: ClassroomPlayerContainerProps) {
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [maxWatchPercentage, setMaxWatchPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Reset watch progress on new lesson change and fetch persistent status
  useEffect(() => {
    let isMounted = true;
    setWatchPercentage(0);
    setMaxWatchPercentage(0);

    async function loadProgress() {
      try {
        const progress = await getCourseProgressAction(courseSlug);
        if (isMounted) {
          const completed = (progress.completedLessonIds || []).includes(lessonId);
          setIsCompleted(completed);
        }
      } catch (err) {
        console.error("Failed to load lesson progress:", err);
      }
    }

    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [courseSlug, lessonId]);

  // Handle time update from video player
  const handleTimeUpdate = useCallback(
    (curr: number, dur: number, pct: number) => {
      setWatchPercentage(pct);
      setMaxWatchPercentage((prev) => Math.max(prev, pct));
    },
    []
  );

  // Problem 3: Auto-Complete when video legitimately finishes until the end
  const handleVideoEnded = useCallback(async () => {
    if (!isCompleted && !isToggling) {
      setIsToggling(true);
      try {
        const res = await markLessonCompletedAction(courseSlug, lessonId);
        if (res.success) {
          setIsCompleted(true);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 4500);

          // Dispatch event to sync sidebar and global UI in real time
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("sakil:progress-updated", {
                detail: { courseSlug, lessonId, isCompleted: true },
              })
            );
          }
        }
      } catch (err) {
        console.error("Auto-complete failed on video ended:", err);
      } finally {
        setIsToggling(false);
      }
    }
  }, [courseSlug, lessonId, isCompleted, isToggling]);

  // Problem 1: Prevent Fake Completion: Locked until >=90% watched
  const handleToggleComplete = async () => {
    if (isToggling) return;

    // If not completed yet, enforce 90% watch threshold
    if (!isCompleted && maxWatchPercentage < 90 && watchPercentage < 90) {
      return;
    }

    setIsToggling(true);
    const prev = isCompleted;
    setIsCompleted(!prev);

    try {
      const res = await toggleLessonCompletionAction(courseSlug, lessonId);
      if (res.success) {
        setIsCompleted(res.isCompleted);
        if (res.isCompleted) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 4500);
        }

        // Dispatch event to sync sidebar and global UI in real time
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("sakil:progress-updated", {
              detail: { courseSlug, lessonId, isCompleted: res.isCompleted },
            })
          );
        }
      } else {
        setIsCompleted(prev);
      }
    } catch {
      setIsCompleted(prev);
    } finally {
      setIsToggling(false);
    }
  };

  const isUnlockThresholdReached =
    isCompleted || maxWatchPercentage >= 90 || watchPercentage >= 90;

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <SecureVideoPlayer
        videoKey={videoKey}
        title={currentLessonTitle}
        poster={poster}
        autoPlay={true}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />

      {/* Auto-completion celebratory toast banner */}
      {showCelebration && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                Lesson Completed!
              </span>
              <span className="text-emerald-300/80 font-normal">
                Your course progress has been automatically updated in your student dashboard.
              </span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
        </div>
      )}

      {/* Lesson Info Tabs & Action Controls */}
      <LessonInfoTabs
        lessonTitle={currentLessonTitle}
        courseSlug={courseSlug}
        lessonId={lessonId}
        moduleTitle={moduleTitle}
        duration={duration}
        attachmentUrl={attachmentUrl}
        attachmentName={attachmentName}
        prevLessonId={prevLessonId}
        nextLessonId={nextLessonId}
        isCompleted={isCompleted}
        isToggling={isToggling}
        isUnlockThresholdReached={isUnlockThresholdReached}
        watchPercentage={Math.max(watchPercentage, maxWatchPercentage)}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
