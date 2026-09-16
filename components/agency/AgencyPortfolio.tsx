"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, MessageCircle, Clock, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ITEMS,
} from "@/lib/data/portfolio";
import { PortfolioCategory, PortfolioItem } from "@/lib/data/portfolio-types";
import VideoModal from "./VideoModal";

export default function AgencyPortfolio() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("all");
  const [activeVideo, setActiveVideo] = useState<PortfolioItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredItems =
    activeCategory === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  // When 'all' is selected, show 6 top items by default to prevent visual overload
  const displayedItems =
    activeCategory === "all" && !showAll
      ? filteredItems.slice(0, 6)
      : filteredItems;

  const activeCategoryMeta = PORTFOLIO_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section id="portfolio" className="relative py-12 sm:py-16 bg-[#02050e] select-none overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[400px] bg-[#00d2ff]/8 blur-[150px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[400px] bg-[#0066ff]/8 blur-[150px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-medium tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ OUR BEST WORKS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Featured <span className="text-[#00d2ff]">Video Portfolio</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            A selection of our most creative and high-performing videos. Each project is crafted with strategy, storytelling and creativity.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
            {PORTFOLIO_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setShowAll(false);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#00d2ff] text-black font-extrabold shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white border border-transparent hover:border-white/10"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3x2 Curated Portfolio Showcase Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          <AnimatePresence>
            {displayedItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                onClick={() => setActiveVideo(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.08] hover:border-[#00d2ff]/40 transition-all duration-500 flex flex-col justify-between cursor-pointer hover:shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.15)]"
              >
                {/* 16:10 Thumbnail Image Box */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-black">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                  />

                  {/* Dark Cinematic Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-black/50" />

                  {/* Top-Left: Category Tag Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-0.8 rounded-full text-[10.5px] font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-white/15">
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Top-Right: Duration Pill */}
                  {item.duration && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md border border-white/15">
                      <Clock className="w-3 h-3 text-[#00d2ff]" />
                      <span>{item.duration}</span>
                    </div>
                  )}

                  {/* Central Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 group-hover:border-[#00d2ff] group-hover:bg-[#00d2ff] group-hover:text-black text-white flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Info Box */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-[#00d2ff] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Cyan Action Link */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Works Centered Button (From Mockup) */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 rounded-full bg-white/[0.03] hover:bg-cyan-500/10 border border-[#00d2ff]/40 text-white font-mono text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>{showAll ? "Show Curated Works" : "View All Projects ➔"}</span>
          </button>
        </div>
      </div>

      {/* Global Interactive Video Modal */}
      <VideoModal item={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}


