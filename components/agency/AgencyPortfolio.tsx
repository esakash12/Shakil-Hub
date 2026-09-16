"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Sparkles, Film, ArrowRight, MessageCircle, Clock, Tag } from "lucide-react";
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ITEMS,
} from "@/lib/data/portfolio";
import { PortfolioCategory, PortfolioItem } from "@/lib/data/portfolio-types";
import VideoModal from "./VideoModal";

export default function AgencyPortfolio() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("all");
  const [activeVideo, setActiveVideo] = useState<PortfolioItem | null>(null);

  const filteredItems =
    activeCategory === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  const activeCategoryMeta = PORTFOLIO_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section id="portfolio" className="relative py-12 sm:py-20 bg-[#05070c] select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Featured Agency Portfolio — Main Focus</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Our Best Video Works & Productions
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Explore our high-converting video productions across commercial advertisements, AI-generated campaigns, luxury real estate tours, wedding films, and creator vlogs.
          </p>
        </div>

        {/* Category Filter Tabs (The 5 exact categories requested) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap">
          {PORTFOLIO_CATEGORIES.map((cat) => {
            const count =
              cat.id === "all"
                ? PORTFOLIO_ITEMS.length
                : PORTFOLIO_ITEMS.filter((i) => i.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105"
                    : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-black/30 text-black font-extrabold" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Description pill */}
        {activeCategoryMeta && (
          <div className="text-center text-xs sm:text-sm text-zinc-400">
            <span>{activeCategoryMeta.description}</span>
          </div>
        )}

        {/* Portfolio Video Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveVideo(item)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0c101a]/90 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-xl hover:shadow-[0_15px_40px_rgba(6,182,212,0.2)] flex flex-col cursor-pointer transform hover:-translate-y-1"
            >
              {/* Thumbnail Box */}
              <div className="relative w-full aspect-video overflow-hidden bg-black/60">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />

                {/* Ambient Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Category Chip */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-cyan-300 border border-white/10 shadow-md">
                    {item.categoryLabel}
                  </span>
                </div>

                {/* Duration Badge */}
                {item.duration && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-black/80 backdrop-blur-md text-zinc-300 border border-white/10">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{item.duration}</span>
                  </div>
                )}

                {/* Central Play Button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-400/90 group-hover:bg-cyan-300 text-black flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-all duration-200">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#0a0d16]/70">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-cyan-400 uppercase tracking-wide">
                    {item.client ? `Client: ${item.client}` : "Commercial Work"}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/5">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-[10px] font-mono text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Bottom Banner: Direct Inquiry Callout */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0e1320] to-emerald-950/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xl backdrop-blur-xl">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-extrabold text-white">
              Want a high-converting video like these for your brand?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400">
              We provide end-to-end production: script, talent casting, cinema shoot, and viral-grade editing.
            </p>
          </div>

          <a
            href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub!%20I%20reviewed%20your%20portfolio%20and%20want%20to%20discuss%20a%20video%20production%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all shrink-0 hover:scale-[1.03] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Chat on WhatsApp (01326896947)</span>
          </a>
        </div>
      </div>

      {/* Global Interactive Video Modal */}
      <VideoModal item={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}
