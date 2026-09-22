"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface CloakedVideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function CloakedVideoPlayer({
  url,
  poster,
  title,
  autoPlay = true,
}: CloakedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ytId = extractYouTubeId(url);
  const isYouTube = Boolean(ytId);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  };

  const sendYtCommand = useCallback(
    (func: string, args: any[] | string = "") => {
      if (!iframeRef.current?.contentWindow) return;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func,
          args: Array.isArray(args) ? args : [args],
        }),
        "*"
      );
    },
    []
  );

  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === "number" && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.playerState === "number") {
            if (data.info.playerState === 1) {
              setIsPlaying(true);
              setIsEnded(false);
            } else if (data.info.playerState === 2) {
              setIsPlaying(false);
            } else if (data.info.playerState === 0) {
              setIsPlaying(false);
              setIsEnded(true);
            }
          }
        }
      } catch {
        // safely ignore
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isYouTube]);

  useEffect(() => {
    if (!isYouTube) return;
    const interval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "listening" }),
          "*"
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isYouTube]);

  const togglePlay = () => {
    if (isYouTube) {
      if (isEnded) {
        sendYtCommand("seekTo", [0, true]);
        sendYtCommand("playVideo");
        setIsPlaying(true);
        setIsEnded(false);
      } else if (isPlaying) {
        sendYtCommand("pauseVideo");
        setIsPlaying(false);
      } else {
        sendYtCommand("playVideo");
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        setIsEnded(false);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (isYouTube) {
      sendYtCommand("seekTo", [targetTime, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (isYouTube) {
      sendYtCommand("setVolume", [val * 100]);
      if (val === 0) sendYtCommand("mute");
      else sendYtCommand("unMute");
    } else if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      const restore = volume === 0 ? 0.8 : volume;
      setVolume(restore);
      setIsMuted(false);
      if (isYouTube) {
        sendYtCommand("unMute");
        sendYtCommand("setVolume", [restore * 100]);
      } else if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = restore;
      }
    } else {
      setIsMuted(true);
      if (isYouTube) {
        sendYtCommand("mute");
      } else if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setIsSpeedMenuOpen(false);
    if (isYouTube) {
      sendYtCommand("setPlaybackRate", [speed]);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard Shortcuts (Space/K, M, F, Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.code === "Space" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const targetTime = Math.max(0, currentTime - 5);
        setCurrentTime(targetTime);
        if (isYouTube) sendYtCommand("seekTo", [targetTime, true]);
        else if (videoRef.current) videoRef.current.currentTime = targetTime;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const maxDur = duration || 1000;
        const targetTime = Math.min(maxDur, currentTime + 5);
        setCurrentTime(targetTime);
        if (isYouTube) sendYtCommand("seekTo", [targetTime, true]);
        else if (videoRef.current) videoRef.current.currentTime = targetTime;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newVol = Math.min(1, volume + 0.1);
        setVolume(newVol);
        setIsMuted(false);
        if (isYouTube) {
          sendYtCommand("unMute");
          sendYtCommand("setVolume", [newVol * 100]);
        } else if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = newVol;
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newVol = Math.max(0, volume - 0.1);
        setVolume(newVol);
        setIsMuted(newVol === 0);
        if (isYouTube) {
          if (newVol === 0) sendYtCommand("mute");
          else {
            sendYtCommand("unMute");
            sendYtCommand("setVolume", [newVol * 100]);
          }
        } else if (videoRef.current) {
          videoRef.current.volume = newVol;
          videoRef.current.muted = newVol === 0;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, isYouTube, isPlaying, isMuted, volume, togglePlay, toggleMute, toggleFullscreen, sendYtCommand]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const ytOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const ytEmbedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&origin=${encodeURIComponent(
        ytOrigin
      )}`
    : "";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group select-none"
    >
      {/* 1. MEDIA LAYER */}
      {isYouTube ? (
        <div className="relative w-full h-full pointer-events-none scale-[1.03] origin-center">
          <iframe
            ref={iframeRef}
            src={ytEmbedSrc}
            title={title || "Sakil Hub Cinema Player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0 pointer-events-none"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          autoPlay={autoPlay}
          preload="metadata"
          playsInline
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onSeeked={() => setIsBuffering(false)}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsEnded(true);
            setIsBuffering(false);
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />
      )}

      {/* 2. TRANSPARENT CLOAKING SHIELD */}
      <div
        onClick={togglePlay}
        className="absolute inset-0 z-20 cursor-pointer bg-transparent"
        title={isPlaying ? "Click to Pause" : "Click to Play"}
      />

      {/* 2.5. BUFFERING SPINNER */}
      {isBuffering && isPlaying && (
        <div className="absolute inset-0 z-24 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full border-2 border-[#00d2ff]/30 border-t-[#00d2ff] animate-spin" />
        </div>
      )}

      {/* 3. CENTER PLAY / PAUSE / REPLAY SPLASH */}
      {(!isPlaying || isEnded) && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-25 flex items-center justify-center pointer-events-auto cursor-pointer bg-black/40 backdrop-blur-[2px] transition-all"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black flex items-center justify-center shadow-[0_0_40px_rgba(0,210,255,0.7)] hover:scale-110 active:scale-95 transition-all">
            {isEnded ? (
              <RotateCcw className="w-7 h-7 stroke-[2.5]" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </div>
        </div>
      )}

      {/* 4. BRANDED CUSTOM CINEMA CONTROLS */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-all duration-300 pointer-events-auto ${
          showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar / Scrubber */}
        <div className="relative group/scrubber mb-3 cursor-pointer py-1">
          <div className="w-full h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all group-hover/scrubber:h-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-[#00d2ff] relative shadow-[0_0_12px_rgba(0,210,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-[#00d2ff] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1 bg-white/20 accent-[#00d2ff] rounded-full cursor-pointer hidden sm:block"
              />
            </div>

            <div className="text-[11px] sm:text-xs font-mono text-zinc-300 pl-1">
              <span className="text-[#00d2ff] font-bold">{formatTime(currentTime)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>
              {isSpeedMenuOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#080d1a] border border-white/10 rounded-xl p-1 shadow-2xl flex flex-col gap-0.5 z-50 min-w-[70px]">
                  {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSpeedChange(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                        playbackSpeed === s
                          ? "bg-[#00d2ff] text-black font-bold"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-[#00d2ff]/40 text-[10px] font-mono font-bold text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.2)]">
              <Sparkles className="w-3 h-3" />
              <span>4K CINEMA</span>
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
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
