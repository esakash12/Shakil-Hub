"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { HomeCmsData, DEFAULT_HOME_CMS } from "@/lib/data/home-cms-types";

interface HeroSectionProps {
  cms?: Partial<HomeCmsData>;
}

export default function HeroSection({ cms }: HeroSectionProps = {}) {
  const data = { ...DEFAULT_HOME_CMS, ...cms };
  return (
    <section className="relative overflow-hidden bg-black py-8 sm:py-16 lg:py-20 min-h-[350px] sm:min-h-[440px] lg:min-h-[500px] flex items-center">
      {/* Subtle Blue Glowing Orb behind Hero text */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[260px] sm:h-[350px] bg-blue-600/15 blur-[90px] rounded-full z-0 pointer-events-none" />

      {/* Hero Background Image (Visible on all screens: Mobile & Desktop) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src={data.heroBackgroundImage || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80"}
          alt="Video Editor Studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:object-right opacity-30 sm:opacity-40 lg:opacity-55"
        />

        {/* Seamless Gradients: solid black fade on mobile & desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30 lg:bg-gradient-to-r lg:from-black lg:via-black/90 lg:to-transparent" />
        <div className="absolute inset-x-0 top-0 h-10 sm:h-16 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Hero Content - Focused, sleek editorial typography */}
        <div className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-4 text-left">
          {/* Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-semibold tracking-wide shadow-[0_0_12px_rgba(6,182,212,0.12)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{data.heroPill}</span>
          </motion.div>

          {/* Headline - Scaled down for elegant proportions */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-tight lg:leading-[1.18]"
          >
            {data.heroHeadlineLine1} <br />
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {data.heroHeadlineHighlight}
            </span>{" "}
            <br />
            {data.heroHeadlineLine2}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xs sm:text-sm md:text-[15px] text-zinc-300 max-w-md sm:max-w-lg leading-relaxed font-normal"
          >
            {data.heroSubtext}
          </motion.p>

          {/* Modern CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-3 pt-2 sm:pt-3"
          >
            <Link
              href={data.heroCtaHref || "#courses"}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 border border-cyan-200/40 shadow-[0_0_18px_rgba(6,182,212,0.3)] hover:shadow-[0_0_28px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <span>{data.heroCtaText}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>

            {data.heroSecondaryCtaText && (
              <Link
                href={data.heroSecondaryCtaHref || "/shop"}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 text-zinc-200 hover:text-white font-bold text-xs sm:text-sm transition-all duration-200 inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                <span>{data.heroSecondaryCtaText}</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
