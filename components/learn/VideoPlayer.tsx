"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  RotateCcw,
  RotateCw,
  Sparkles,
} from "lucide-react";

export default function VideoPlayer({
  lessonTitle = "Basic Timeline",
}: {
  lessonTitle?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(65); // 65% progress simulation

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl group select-none">
      {/* Video Background Mockup Image */}
      <Image
        src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80"
        alt={lessonTitle}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 70vw"
        className="object-cover opacity-75 group-hover:opacity-85 transition-opacity duration-300"
      />

      {/* Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 pointer-events-none" />

      {/* Center Play/Pause Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.6)] backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 ${
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
          ) : (
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
          )}
        </button>
      </div>

      {/* Top Bar inside Player */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-[11px] text-blue-400 font-medium backdrop-blur-md">
            <Sparkles className="w-3 h-3" />
            4K HDR
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {lessonTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 bg-black/60 px-2 py-0.5 rounded border border-white/5">
            Auto (1080p)
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity">
        {/* Scrubber / Progress Bar */}
        <div
          className="relative w-full h-1.5 hover:h-2.5 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all mb-3 group/bar"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = ((e.clientX - rect.left) / rect.width) * 100;
            setProgress(Math.max(0, Math.min(100, pos)));
          }}
        >
          {/* Loaded buffer bar */}
          <div className="absolute top-0 left-0 bottom-0 w-[80%] bg-white/20 rounded-full" />
          {/* Played progress bar */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setProgress((p) => Math.max(0, p - 5))}
              aria-label="Rewind 10 seconds"
              className="hover:text-blue-400 transition-colors hidden sm:block"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setProgress((p) => Math.min(100, p + 5))}
              aria-label="Forward 10 seconds"
              className="hover:text-blue-400 transition-colors hidden sm:block"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="hover:text-blue-400 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Timestamp */}
            <span className="text-[11px] sm:text-xs font-mono text-gray-300">
              18:45 / 20:30
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-gray-300">
              1.0x
            </span>

            <button
              type="button"
              aria-label="Player settings"
              className="hover:text-blue-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Fullscreen mode"
              className="hover:text-blue-400 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
