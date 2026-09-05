"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Video, RefreshCw } from "lucide-react";
import { getPresignedViewUrl } from "@/lib/actions/cloudflare-r2";
import CustomVideoPlayer from "@/components/ui/CustomVideoPlayer";

interface SecureVideoPlayerProps {
  videoKey: string;
  title?: string;
  badge?: string;
  poster?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number, percentage: number) => void;
  className?: string;
}

export default function SecureVideoPlayer({
  videoKey,
  title,
  badge = "HD Stream",
  poster,
  autoPlay = true,
  onEnded,
  onTimeUpdate,
  className = "",
}: SecureVideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStreamUrl = async () => {
    if (!videoKey || !videoKey.trim()) {
      setIsLoading(false);
      setErrorMsg("No video file attached to this lecture.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // If videoKey is already a full direct URL (e.g. YouTube, Vimeo, MP4 CDN)
      if (
        videoKey.startsWith("http://") ||
        videoKey.startsWith("https://") ||
        videoKey.includes("youtube.com") ||
        videoKey.includes("youtu.be") ||
        videoKey.includes("vimeo.com")
      ) {
        setStreamUrl(videoKey);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch Cloudflare R2 Presigned URL
      const res = await getPresignedViewUrl(videoKey);
      if (res.success && res.viewUrl) {
        setStreamUrl(res.viewUrl);
      } else {
        setErrorMsg(
          res.error || "Failed to load video stream. Invalid Key or Network Error."
        );
      }
    } catch {
      setErrorMsg("Failed to load video stream. Invalid Key or Network Error.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamUrl();
  }, [videoKey]);

  if (isLoading) {
    return (
      <div
        className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center space-y-3 ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
        <p className="text-xs font-mono text-gray-400 animate-pulse">
          Authorizing secure Cloudflare R2 video stream...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md">
          <h4 className="text-sm font-bold text-red-400">
            Failed to load video stream
          </h4>
          <p className="text-xs text-gray-400">{errorMsg}</p>
        </div>
        <button
          type="button"
          onClick={fetchStreamUrl}
          className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer mt-2"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div
        className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 flex flex-col items-center justify-center text-gray-500 space-y-2 ${className}`}
      >
        <Video className="w-10 h-10 stroke-1" />
        <p className="text-xs">No video stream linked to this lecture.</p>
      </div>
    );
  }

  return (
    <CustomVideoPlayer
      src={streamUrl}
      title={title}
      badge={badge}
      poster={poster}
      autoPlay={autoPlay}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      className={className}
    />
  );
}
