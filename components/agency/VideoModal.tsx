"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Play, Sparkles } from "lucide-react";
import { PortfolioItem } from "@/lib/data/portfolio-types";

interface VideoModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export default function VideoModal({ item, onClose }: VideoModalProps) {
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

  if (!item) return null;

  // Generate safe embed URL or detect direct video
  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return (
      url.startsWith("/uploads/") ||
      url.startsWith("/api/r2/") ||
      url.match(/\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i) !== null
    );
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  const isDirect = isDirectVideo(item.videoUrl);
  const embedSrc = !isDirect ? getEmbedUrl(item.videoUrl) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0a0d14] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#0c101a]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shrink-0">
              {item.categoryLabel}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[220px] sm:max-w-md">
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

        {/* Video Player Box */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isDirect && item.videoUrl ? (
            <video
              src={item.videoUrl}
              controls
              autoPlay
              playsInline
              poster={item.thumbnail}
              className="w-full h-full object-contain bg-black"
            />
          ) : embedSrc ? (
            <iframe
              src={`${embedSrc}?autoplay=1&rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
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

        {/* Modal Project Details Footer */}
        <div className="p-4 sm:p-6 bg-[#080a10] border-t border-white/5 space-y-3">
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
              <span>Get Similar Video on WhatsApp</span>
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
