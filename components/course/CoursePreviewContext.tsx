"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CourseDetail } from "@/lib/data/courses";
import { getPresignedViewUrl } from "@/lib/actions/cloudflare-r2";

interface PreviewPayload {
  src: string;
  title: string;
  badge?: string;
  poster?: string;
}

interface CoursePreviewContextType {
  activeVideoSrc: string;
  activePoster: string;
  activeTitle: string;
  activeBadge: string;
  isPlayingPreview: boolean;
  playPreview: (payload: PreviewPayload) => Promise<void>;
  resetToTrailer: () => void;
}

const CoursePreviewContext = createContext<CoursePreviewContextType | undefined>(
  undefined
);

export function CoursePreviewProvider({
  course,
  children,
}: {
  course: CourseDetail;
  children: React.ReactNode;
}) {
  const defaultTrailerSrc = course.trailerVideo || "";
  const defaultPoster =
    course.thumbnail || course.trailerImage || course.image || "";
  const defaultTitle = `${course.title} — Official Trailer`;
  const defaultBadge = course.badge || "Masterclass";

  const [activeVideoSrc, setActiveVideoSrc] = useState(defaultTrailerSrc);
  const [activePoster, setActivePoster] = useState(defaultPoster);
  const [activeTitle, setActiveTitle] = useState(defaultTitle);
  const [activeBadge, setActiveBadge] = useState(defaultBadge);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const playPreview = useCallback(
    async (payload: PreviewPayload) => {
      if (!payload.src) return;

      let resolvedUrl = payload.src.trim();

      // If it's an R2 key or relative path, resolve to pre-signed URL or proxy
      if (
        !resolvedUrl.startsWith("http://") &&
        !resolvedUrl.startsWith("https://") &&
        !resolvedUrl.startsWith("blob:") &&
        !resolvedUrl.startsWith("/")
      ) {
        try {
          const res = await getPresignedViewUrl(resolvedUrl);
          if (res.success && res.viewUrl) {
            resolvedUrl = res.viewUrl;
          } else {
            resolvedUrl = `/api/r2/${resolvedUrl}`;
          }
        } catch {
          resolvedUrl = `/api/r2/${resolvedUrl}`;
        }
      }

      setActiveVideoSrc(resolvedUrl);
      setActiveTitle(payload.title || "Lesson Preview");
      setActiveBadge(payload.badge || "Free Preview");
      if (payload.poster) setActivePoster(payload.poster);
      setIsPlayingPreview(true);

      // Smooth scroll to the active player (Curriculum Player on mobile, Theater Player on desktop)
      if (typeof window !== "undefined") {
        const isMobile = window.innerWidth < 1024;
        const targetEl = isMobile
          ? document.getElementById("curriculum-preview-player") ||
            document.getElementById("course-theater-player")
          : document.getElementById("course-theater-player") ||
            document.getElementById("curriculum-preview-player");
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    },
    []
  );

  const resetToTrailer = useCallback(() => {
    setActiveVideoSrc(defaultTrailerSrc);
    setActivePoster(defaultPoster);
    setActiveTitle(defaultTitle);
    setActiveBadge(defaultBadge);
    setIsPlayingPreview(false);
  }, [defaultTrailerSrc, defaultPoster, defaultTitle, defaultBadge]);

  return (
    <CoursePreviewContext.Provider
      value={{
        activeVideoSrc,
        activePoster,
        activeTitle,
        activeBadge,
        isPlayingPreview,
        playPreview,
        resetToTrailer,
      }}
    >
      {children}
    </CoursePreviewContext.Provider>
  );
}

export function useCoursePreview() {
  const context = useContext(CoursePreviewContext);
  if (!context) {
    throw new Error(
      "useCoursePreview must be used within a CoursePreviewProvider"
    );
  }
  return context;
}