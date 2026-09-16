"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, MessageCircle, Play, Star, Sparkles, Film, ShieldCheck } from "lucide-react";
import VideoModal from "./VideoModal";
import { PORTFOLIO_ITEMS } from "@/lib/data/portfolio";

export default function AgencyHero() {
  const [showreelOpen, setShowreelOpen] = useState(false);

  const showreelItem = PORTFOLIO_ITEMS[0]; // Cyberpunk Next-Gen commercial as flagship showreel

  const tickerItems = [
    "AI COMMERCIALS",
    "4K / 6K CINEMA SHOOT",
    "STUDIO RENT AVAILABLE",
    "SCRIPT TO SCREEN",
    "VIRAL SOCIAL ADS",
    "DIRECTED BY MEHEDI HASAN SAKIL",
    "COLOR GRADING & VFX",
    "15M+ ORGANIC VIEWS",
  ];

  return (
    <section className="relative overflow-hidden bg-[#020306] pt-14 sm:pt-20 pb-12 sm:pb-16 select-none">
      {/* Centered Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-cyan-600/12 via-blue-600/8 to-transparent blur-[140px] rounded-full pointer-events-none -z-0" />

      {/* Subtle Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 sm:space-y-9">
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-[11px] font-mono tracking-wider shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-zinc-300 uppercase">
            STUDIO STATUS: <strong className="text-white font-semibold">AVAILABLE FOR NEW PROJECTS</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-cyan-400 font-medium">DHAKA / GLOBAL</span>
        </motion.div>

        {/* Centered Bold Headline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            We Craft High-Converting{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
              Cinematic Videos
            </span>{" "}
            & AI Commercials
          </h1>

          <p className="text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Turnkey commercial production, AI-driven visual storytelling, and high-CTR brand ads. Directed by{" "}
            <strong className="text-white font-semibold">Mehedi Hasan Sakil</strong> with private studio access, cinema cameras, and certified talent casting.
          </p>
        </motion.div>

        {/* Centered Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1"
        >
          <a
            href="#portfolio"
            className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Explore Portfolio / কাজ দেখুন</span>
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </a>

          <a
            href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub!%20I%20would%20like%20to%20book%20a%20Free%20Meeting%20%26%20Consultation%20for%20my%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-emerald-500/40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>WhatsApp: 01326896947</span>
          </a>
        </motion.div>

        {/* Featured Centerpiece Showreel Card (Fills visual void & balances screen!) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-4xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-[#070a11] border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.9)] group cursor-pointer"
          onClick={() => setShowreelOpen(true)}
        >
          <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full overflow-hidden bg-black">
            <Image
              src={showreelItem.thumbnail}
              alt="Sakil Hub Agency Showreel"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a11] via-black/20 to-transparent" />

            {/* Top Bar on Showreel */}
            <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-center justify-between pointer-events-none">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-black/80 backdrop-blur-md text-cyan-300 border border-white/10">
                OFFICIAL AGENCY REEL 2026
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md border border-white/10">
                4K CINEMA MASTER
              </span>
            </div>

            {/* Play Button Capsule */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-5 py-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 group-hover:border-cyan-400 text-white group-hover:text-cyan-300 flex items-center gap-2.5 text-xs font-mono font-bold tracking-wider shadow-[0_0_30px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-all">
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>WATCH SHOWREEL • 0:45</span>
              </div>
            </div>
          </div>

          {/* Integrated Trust Metric Strip Across Bottom of Frame */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06] border-t border-white/[0.08] bg-[#06080e]/90 text-center py-3.5 px-2">
            <div className="space-y-0.5 px-2">
              <div className="text-lg sm:text-xl font-black text-white font-mono">500+</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Commercial Works</div>
            </div>
            <div className="space-y-0.5 px-2">
              <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">4K / 6K</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Cinema Standard</div>
            </div>
            <div className="space-y-0.5 px-2">
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">48h Rush</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Turnaround Option</div>
            </div>
            <div className="space-y-0.5 px-2">
              <div className="text-lg sm:text-xl font-black text-white font-mono flex items-center justify-center gap-1">
                <span>4.9</span>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Client Rating</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Kinetic Infinite Scrolling Marquee Strip */}
      <div className="relative w-full overflow-hidden border-y border-white/[0.06] bg-white/[0.01] py-3 mt-10 sm:mt-14">
        <div className="flex whitespace-nowrap animate-marquee select-none">
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-3 mx-4 text-xs font-mono tracking-widest text-zinc-400 uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Video Modal for Showreel */}
      <VideoModal
        item={showreelOpen ? showreelItem : null}
        onClose={() => setShowreelOpen(false)}
      />
    </section>
  );
}


