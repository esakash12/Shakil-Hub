"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Sparkles,
  Loader2,
  PictureInPicture2,
  Check,
  Zap,
} from "lucide-react";

export interface CustomVideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  badge?: string;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number, percentage: number) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${remMins < 10 ? "0" : ""}${remMins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(ytRegex);
  return match
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
    : null;
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const match = url.match(vimeoRegex);
  return match
    ? `https://player.vimeo.com/video/${match[1]}?autoplay=1`
    : null;
}

export default function CustomVideoPlayer({
  src,
  poster,
  title = "Course Preview Trailer",
  badge = "Preview",
  autoPlay = false,
  className = "",
  onEnded,
  onTimeUpdate,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Reliable Fallback Video for Storefront Trailers
  const resolvedVideoSrc =
    src && src.trim().length > 0
      ? src
      : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

  const ytEmbed = getYouTubeEmbedUrl(resolvedVideoSrc);
  const vimeoEmbed = getVimeoEmbedUrl(resolvedVideoSrc);

  // Player State
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [centerAnimation, setCenterAnimation] = useState<"play" | "pause" | null>(null);

  // Robust, race-condition-safe video play
  const safePlay = useCallback(async () => {
    if (!videoRef.current) return;
    setHasStarted(true);

    try {
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        await promise;
        playPromiseRef.current = null;
        setIsPlaying(true);
        setIsBuffering(false);
      }
    } catch (err: any) {
      playPromiseRef.current = null;
      if (
        err?.name === "AbortError" ||
        err?.name === "NotSupportedError" ||
        err?.message?.includes("interrupted") ||
        err?.message?.includes("pause") ||
        err?.message?.includes("supported source")
      ) {
        return;
      }
      console.warn("Video playback was deferred or restricted:", err);
    }
  }, []);

  // Robust, race-condition-safe video pause
  const safePause = useCallback(async () => {
    if (!videoRef.current) return;

    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {}
      playPromiseRef.current = null;
    }

    try {
      videoRef.current.pause();
      setIsPlaying(false);
    } catch {}
  }, []);

  // Source swap & autoPlay synchronization
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);

    if (autoPlay) {
      setHasStarted(true);
      const timer = setTimeout(() => {
        safePlay();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [resolvedVideoSrc, autoPlay, safePlay]);

  // Auto-pause if another HTML5 video on the page begins playing
  useEffect(() => {
    const handleGlobalPlay = (e: Event) => {
      const currentVideo = videoRef.current;
      if (e.target !== currentVideo && currentVideo && !currentVideo.paused) {
        safePause();
      }
    };

    window.addEventListener("play", handleGlobalPlay, true);
    return () => {
      window.removeEventListener("play", handleGlobalPlay, true);
    };
  }, [safePause]);

  // Reset controls hide timer
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && !isScrubbing && !isSpeedMenuOpen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isScrubbing, isSpeedMenuOpen]);

  // Handle Play/Pause
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    if (!hasStarted) setHasStarted(true);

    if (videoRef.current.paused || videoRef.current.ended) {
      setCenterAnimation("play");
      setTimeout(() => setCenterAnimation(null), 500);
      await safePlay();
    } else {
      setCenterAnimation("pause");
      setTimeout(() => setCenterAnimation(null), 500);
      await safePause();
    }
  }, [hasStarted, safePlay, safePause]);

  // Handle Seek
  const seekTo = useCallback(
    (timeInSeconds: number) => {
      if (!videoRef.current) return;
      const targetTime = Math.max(0, Math.min(timeInSeconds, duration || 0));
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration]
  );

  const handleSkip = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      seekTo(videoRef.current.currentTime + seconds);
      resetHideControlsTimer();
    },
    [seekTo, resetHideControlsTimer]
  );

  // Volume & Mute
  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    const vol = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        handleVolumeChange(0.5);
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Playback Rate
  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setIsSpeedMenuOpen(false);
    resetHideControlsTimer();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PiP not supported:", err);
    }
  };

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current || !containerRef.current.contains(document.activeElement)) {
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          handleSkip(-5);
          break;
        case "arrowright":
          e.preventDefault();
          handleSkip(5);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, handleSkip, volume, isMuted]);

  // Scrubbing Calculations
  const calculateProgressFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, pos));
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const pos = calculateProgressFromEvent(e);
    if (duration > 0) {
      seekTo(pos * duration);
    }
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = calculateProgressFromEvent(e);
    setHoverPosition(pos * 100);
    if (duration > 0) {
      setHoverTime(pos * duration);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isScrubbing && duration > 0) {
        const pos = calculateProgressFromEvent(e);
        seekTo(pos * duration);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isScrubbing, duration, seekTo]);

  // If iframe embed (YouTube/Vimeo)
  if (ytEmbed || vimeoEmbed) {
    return (
      <div
        className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-cyan-500/20 shadow-2xl ${className}`}
      >
        <iframe
          src={ytEmbed || vimeoEmbed || ""}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={resetHideControlsTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying && !isSpeedMenuOpen) setShowControls(false);
      }}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 hover:border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.85)] select-none group focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-colors duration-300 ${
        !showControls && isPlaying ? "cursor-none" : "cursor-default"
      } ${className}`}
    >
      {/* 1. Underlying Native HTML5 Video Element with Key Remounting for Flawless Source Swaps */}
      <video
        key={resolvedVideoSrc}
        ref={videoRef}
        src={resolvedVideoSrc}
        poster={poster}
        playsInline
        preload="auto"
        onLoadStart={() => setIsBuffering(true)}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onLoadedData={() => setIsBuffering(false)}
        onCanPlay={() => {
          setIsBuffering(false);
          if (autoPlay || hasStarted) {
            safePlay();
          }
        }}
        onCanPlayThrough={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onStalled={() => setIsBuffering(true)}
        onSeeking={() => setIsBuffering(true)}
        onSeeked={() => setIsBuffering(false)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            const curr = videoRef.current.currentTime;
            const dur = videoRef.current.duration || 0;
            setCurrentTime(curr);
            if (dur > 0 && onTimeUpdate) {
              const pct = (curr / dur) * 100;
              onTimeUpdate(curr, dur, pct);
            }
            if (videoRef.current.buffered.length > 0) {
              setBufferedEnd(
                videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
              );
            }
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
          if (onEnded) onEnded();
        }}
        onError={() => setIsBuffering(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain bg-black cursor-pointer"
      />

      {/* 2. Initial Poster & Big Glowing Neon Cyan Play Banner */}
      {!hasStarted && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-20 bg-neutral-950 flex items-center justify-center cursor-pointer group/poster overflow-hidden"
        >
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover opacity-85 group-hover/poster:scale-105 group-hover/poster:opacity-95 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
              <span className="text-base font-bold text-white tracking-tight line-clamp-1 max-w-xs mb-1">
                {title}
              </span>
              <span className="text-xs text-cyan-400 uppercase tracking-wider font-mono">
                {badge} Preview
              </span>
            </div>
          )}

          {/* Dark Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 pointer-events-none" />

          {/* Center Glowing Neon Cyan Play Button - Elegant, proportionate size */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-cyan-500/35 blur-md animate-pulse" />
              <button
                type="button"
                aria-label="Play course trailer"
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_22px_rgba(6,182,212,0.55)] backdrop-blur-md border border-cyan-300/40 group-hover/poster:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
              </button>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/30 text-[11px] font-medium text-cyan-200 tracking-wide shadow-md">
              Click to Watch Trailer
            </span>
          </div>

          {/* Bottom Badge Bar */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/20 text-xs text-gray-200 z-10 pointer-events-none">
            <span className="font-semibold flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              {badge} Masterclass Stream
            </span>
            <span className="font-mono text-cyan-400 font-medium drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              Full HD 1080p
            </span>
          </div>
        </div>
      )}

      {/* 3. Center Ripple Flash Animation on Play/Pause */}
      {centerAnimation && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-75 duration-200">
          <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center text-white shadow-2xl">
            {centerAnimation === "play" ? (
              <Play className="w-8 h-8 fill-cyan-400 text-cyan-400 ml-1" />
            ) : (
              <Pause className="w-8 h-8 fill-cyan-400 text-cyan-400" />
            )}
          </div>
        </div>
      )}

      {/* 4. Neon Cyan Glowing Buffering & Loading Spinner Overlay */}
      {isBuffering && hasStarted && (
        <div className="absolute inset-0 z-25 flex flex-col items-center justify-center pointer-events-none bg-black/50 backdrop-blur-[3px] transition-all duration-200">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-cyan-500/30 blur-lg animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-neutral-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-xl">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          </div>
          <span className="mt-3 px-3 py-1 rounded-full bg-black/80 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 font-medium tracking-wide shadow-lg">
            Buffering HD Stream...
          </span>
        </div>
      )}

      {/* 5. Top Header Gradient Bar */}
      <div
        className={`absolute top-0 inset-x-0 z-30 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-[10px] sm:text-xs font-bold text-cyan-300 tracking-wider uppercase backdrop-blur-md">
            {badge}
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-md">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/[0.08] backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-cyan-300 font-medium">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            1080p 60fps
          </span>
        </div>
      </div>

      {/* 6. Bottom Controls Master Bar with Neon Cyan Gradient */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 pt-8 pb-2.5 px-2.5 sm:pb-3 sm:px-3.5 bg-gradient-to-t from-black via-black/85 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* A. Interactive Custom Progress Bar */}
        <div
          ref={progressBarRef}
          onMouseDown={handleProgressBarMouseDown}
          onMouseMove={handleProgressBarMouseMove}
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => {
            setIsHoveringBar(false);
            setHoverPosition(null);
            setHoverTime(null);
          }}
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer transition-all duration-200 mb-2.5 group/progress flex items-center"
        >
          {/* Hover Time Tooltip */}
          {isHoveringBar && hoverPosition !== null && hoverTime !== null && (
            <div
              className="absolute -top-8 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900 border border-cyan-500/40 text-[11px] font-mono font-bold text-cyan-300 shadow-xl pointer-events-none z-40"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Buffered Stream Bar */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-white/30 rounded-full transition-all duration-300"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Hover Preview Track */}
          {isHoveringBar && hoverPosition !== null && (
            <div
              className="absolute top-0 left-0 bottom-0 bg-white/20 rounded-full pointer-events-none"
              style={{ width: `${hoverPosition}%` }}
            />
          )}

          {/* Played Progress Bar with Neon Cyan Glow */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scrubber Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-3.5 h-3.5 bg-cyan-300 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.9)] border-2 border-white scale-0 group-hover/progress:scale-100 transition-transform duration-150 z-30"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* B. Controls Row - Guarded with shrink-0 and min-w-0 to prevent right-edge clipping */}
        <div className="w-full min-w-0 flex items-center justify-between gap-1.5 sm:gap-3 text-white">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 overflow-hidden">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="w-8 h-8 shrink-0 rounded-lg bg-white/10 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 flex items-center justify-center text-white hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip 10s Backward */}
            <button
              type="button"
              onClick={() => handleSkip(-10)}
              aria-label="Rewind 10 seconds"
              className="p-1.5 shrink-0 text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer hidden sm:inline-flex"
              title="Rewind 10s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Skip 10s Forward */}
            <button
              type="button"
              onClick={() => handleSkip(10)}
              aria-label="Fast forward 10 seconds"
              className="p-1.5 shrink-0 text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer hidden sm:inline-flex"
              title="Forward 10s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Volume Control Group */}
            <div className="flex items-center gap-1 shrink-0 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="p-1.5 text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Volume slider"
                className="w-12 sm:w-16 h-1 bg-white/20 hover:bg-white/40 accent-cyan-400 rounded-lg cursor-pointer transition-all duration-150 hidden xs:inline-block"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[10px] sm:text-xs font-mono text-gray-300 font-medium shrink-0 whitespace-nowrap">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, PiP, Fullscreen - Strictly shrink-0 to prevent right clipping */}
          <div className="flex items-center gap-1 sm:gap-1.5 relative shrink-0 pr-0.5">
            {/* Speed Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-[11px] font-mono font-bold text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Playback Speed"
              >
                <span>{playbackRate}x</span>
              </button>

              {isSpeedMenuOpen && (
                <div className="absolute bottom-9 right-0 py-1.5 px-1 rounded-xl bg-neutral-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl z-50 flex flex-col min-w-[90px] animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Speed
                  </div>
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                        playbackRate === rate
                          ? "bg-cyan-500/20 text-cyan-300 font-bold"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              type="button"
              onClick={togglePiP}
              aria-label="Picture in Picture"
              className="p-1.5 text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer hidden sm:inline-flex shrink-0"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="p-1.5 text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
              title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}