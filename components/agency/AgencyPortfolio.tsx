"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, MessageCircle, Clock, ArrowUpRight } from "lucide-react";
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
    <section id="portfolio" className="relative py-16 sm:py-24 bg-[#030407] select-none overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-cyan-600/8 blur-[150px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-emerald-600/8 blur-[150px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-cyan-400 text-xs font-mono font-medium tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>01 // SELECTED ARCHIVE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Featured Video Portfolio
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            Every frame engineered for high viewer retention, brand prestige, and commercial conversions. Filter by category below:
          </p>
        </div>

        {/* Category Filter Tabs with Framer Motion Sliding Pill */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
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
                  className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive ? "text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                  <span
                    className={`relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-black/25 text-black font-bold" : "bg-white/[0.06] text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Category Description Notice */}
        {activeCategoryMeta && (
          <div className="text-center text-xs text-zinc-400 font-mono tracking-wide">
            <span>// {activeCategoryMeta.description}</span>
          </div>
        )}

        {/* Animated Portfolio Showcase Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                onClick={() => setActiveVideo(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#080b12] border border-white/[0.08] hover:border-cyan-400/40 transition-all duration-500 flex flex-col cursor-pointer hover:shadow-[0_15px_45px_rgba(0,0,0,0.8)]"
              >
                {/* 16:9 Thumbnail Widescreen */}
                <div className="relative w-full aspect-video overflow-hidden bg-black">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                  />

                  {/* Dark Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-black/40" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-cyan-300 border border-white/10">
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Duration Badge */}
                  {item.duration && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md border border-white/10">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{item.duration}</span>
                    </div>
                  )}

                  {/* Sleek Minimalist Play Capsule Hover Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 group-hover:border-cyan-400 text-white group-hover:text-cyan-300 flex items-center gap-2 text-xs font-mono tracking-wider shadow-lg group-hover:scale-105 transition-all">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>PLAY FILM</span>
                    </div>
                  </div>
                </div>

                {/* Card Info Box */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="text-[10.5px] font-mono uppercase text-cyan-400 tracking-wider">
                      {item.client ? `Client: ${item.client}` : "Studio Production"}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Small tag chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/[0.06]">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.05]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Portfolio Bottom Banner: Direct Inquiry Callout */}
        <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[#0a0d16] to-emerald-950/20 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl backdrop-blur-xl">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Commission a high-converting video for your brand
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400">
              Complete production lifecycle: scriptwriting, talent casting, cinema shoot, and viral-grade editing.
            </p>
          </div>

          <a
            href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub!%20I%20reviewed%20your%20portfolio%20and%20want%20to%20discuss%20a%20video%20production%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all shrink-0 hover:scale-[1.03] cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black" />
            <span>Chat on WhatsApp (01326896947)</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>
      </div>

      {/* Global Interactive Video Modal */}
      <VideoModal item={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}

