"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, MessageCircle, Film, Sparkles, Play, Camera, Star } from "lucide-react";

export default function AgencyHero() {
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
    <section className="relative overflow-hidden bg-[#030508] pt-12 sm:pt-20 pb-16 sm:pb-24 min-h-[580px] lg:min-h-[660px] flex flex-col justify-between select-none">
      {/* Cinematic Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-0 right-10 w-72 h-72 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none -z-0" />

      {/* Subtle Studio Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="max-w-3xl space-y-6 text-left">
          {/* Live Studio Availability Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-[11px] font-mono tracking-wider shadow-sm"
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

          {/* Kinetic Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]"
          >
            We Craft High-Converting{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
              Cinematic Videos
            </span>{" "}
            & AI Commercials
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed font-normal"
          >
            Turnkey commercial production, AI-driven visual storytelling, and high-CTR brand ads. Directed by{" "}
            <strong className="text-white font-semibold">Mehedi Hasan Sakil</strong> with private studio access, cinema cameras, and certified talent casting.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
          >
            {/* Primary CTA: Jump straight to Portfolio */}
            <a
              href="#portfolio"
              className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explore Portfolio</span>
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </a>

            {/* Secondary CTA: WhatsApp Free Consultation */}
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

          {/* Minimalist Trust Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 sm:pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
          >
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">500+</div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Commercial Works</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight">4K / 6K</div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Cinema Standard</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">48h Rush</div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Turnaround Option</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-1">
                <span>4.9</span>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase">Client Rating</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Kinetic Infinite Scrolling Marquee Strip */}
      <div className="relative w-full overflow-hidden border-y border-white/[0.06] bg-white/[0.01] py-3 mt-12 sm:mt-16">
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
    </section>
  );
}

