"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, MessageCircle, Sparkles, Film, CheckCircle2, Play } from "lucide-react";

export default function AgencyHero() {
  return (
    <section className="relative overflow-hidden bg-black py-10 sm:py-16 lg:py-24 min-h-[460px] sm:min-h-[520px] lg:min-h-[600px] flex items-center select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] sm:h-[400px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-emerald-600/10 blur-[110px] rounded-full z-0 pointer-events-none" />

      {/* Cinematic Background Backdrop Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 sm:opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1920&q=80"
          alt="Sakil Hub Creative Studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradients to keep text crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-4 sm:space-y-6 text-left">
          {/* Top Pill: Agency Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs sm:text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-in fade-in duration-500">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Commercial Video Production & AI Creative Agency</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            We Craft High-Converting{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]">
              Cinematic Videos
            </span>{" "}
            That Scale Brands & Sales
          </h1>

          {/* Subtext */}
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-2xl leading-relaxed font-normal">
            From cutting-edge <strong className="text-white font-semibold">AI commercials</strong> and high-CTR{" "}
            <strong className="text-white font-semibold">promotional ads</strong> to luxury{" "}
            <strong className="text-white font-semibold">real estate tours</strong>, wedding cinema, and creator vlogs. Directed by{" "}
            <strong className="text-cyan-400 font-semibold">Mehedi Hasan Sakil</strong> and a dedicated production crew.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            {/* Primary CTA: Jump straight to Portfolio */}
            <a
              href="#portfolio"
              className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explore Portfolio / কাজ দেখুন</span>
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </a>

            {/* Secondary CTA: WhatsApp Free Consultation */}
            <a
              href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub!%20I%20would%20like%20to%20book%20a%20Free%20Meeting%20%26%20Consultation%20for%20my%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-emerald-500/40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp: 01326896947</span>
            </a>
          </div>

          {/* Trust Metric Strip */}
          <div className="pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black text-white font-mono">500+</div>
              <div className="text-[11px] text-zinc-400">Commercial Videos Done</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black text-cyan-400 font-mono">4K / 6K</div>
              <div className="text-[11px] text-zinc-400">Cinema Grade Quality</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black text-emerald-400 font-mono">48h Rush</div>
              <div className="text-[11px] text-zinc-400">Turnaround Available</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black text-purple-400 font-mono">100% Free</div>
              <div className="text-[11px] text-zinc-400">Strategy Consultation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
