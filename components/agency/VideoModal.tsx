"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ExternalLink, Play, Sparkles } from "lucide-react";
import { PortfolioItem } from "@/lib/data/portfolio-types";
import CloakedVideoPlayer from "./CloakedVideoPlayer";

interface VideoModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export default function VideoModal({ item, onClose }: VideoModalProps) {
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  // Touch handlers attached strictly to the top drag handle/header to prevent video timeline interference
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setSheetTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (sheetTranslateY > 80) {
      onClose();
    }
    setSheetTranslateY(0);
    touchStartY.current = null;
  };

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 lg:p-10 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-4xl bg-[#0a0d14] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.95)] md:shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        style={{
          transform: sheetTranslateY > 0 ? `translateY(${sheetTranslateY}px)` : undefined,
          transition: sheetTranslateY === 0 ? "transform 0.2s ease-out" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cinema Ambient Lighting Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-[#00d2ff]/20 via-[#0066ff]/20 to-[#00d2ff]/20 rounded-3xl blur-2xl pointer-events-none -z-10" />

        {/* Modal Top Drag Handle / Header (Only this area handles drag-to-dismiss) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-4 sm:px-6 pt-2 pb-3 border-b border-white/10 bg-[#0c101a]/95 touch-none select-none cursor-grab active:cursor-grabbing md:cursor-default"
        >
          {/* Mobile Drag Indicator Bar */}
          <div className="w-12 h-1.5 rounded-full bg-white/25 hover:bg-white/40 mx-auto mb-2 md:hidden transition-colors" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shrink-0">
                {item.categoryLabel}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {item.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Box (Completely free of drag listeners, allows timeline scrubbing) */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden shrink-0">
          {item.videoUrl ? (
            <CloakedVideoPlayer
              url={item.videoUrl}
              poster={item.thumbnail}
              title={item.title}
              autoPlay={true}
            />
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
                <Play className="w-6 h-6 ml-1" />
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                Preview video player is ready for production streaming.
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Project Details Section (Below Video) */}
        <div className="p-4 sm:p-6 bg-[#080a10] border-t border-white/5 space-y-3 overflow-y-auto max-h-[35vh] sm:max-h-none no-scrollbar">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{item.title}</span>
                {item.client && (
                  <span className="text-xs font-normal text-cyan-400">
                    • Client: {item.client}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                {item.description}
              </p>
            </div>

            {/* Quick WhatsApp Inquiry for this exact style */}
            <a
              href={`https://wa.me/8801326896947?text=${encodeURIComponent(
                `Hello Sakil Hub! I watched your portfolio project "${item.title}" (${item.categoryLabel}) and I want to produce a similar video for my brand.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all shrink-0 cursor-pointer"
            >
              <span>Inquire for Similar Project</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-[10.5px] font-mono text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
