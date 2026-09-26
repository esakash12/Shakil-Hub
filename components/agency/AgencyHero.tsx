"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Users,
  Layers,
  Volume2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { PortfolioItem } from "@/lib/data/portfolio-types";
import { AgencyCmsData } from "@/lib/data/agency-cms-types";

const VideoModal = dynamic(() => import("./VideoModal"), { ssr: false });

export default function AgencyHero({
  cmsData,
  featuredItem,
}: {
  cmsData?: AgencyCmsData;
  featuredItem?: PortfolioItem;
}) {
  const [showreelOpen, setShowreelOpen] = useState(false);
  const showreelItem: PortfolioItem = {
    id: featuredItem?.id || "showreel-default",
    title: featuredItem?.title || "Sakil Hub — Agency Showreel",
    category: featuredItem?.category || "commercials",
    categoryLabel: featuredItem?.categoryLabel || "Agency Reel",
    videoUrl: cmsData?.heroShowreelVideoUrl || featuredItem?.videoUrl || "",
    thumbnail:
      cmsData?.heroWorkstationImage ||
      featuredItem?.thumbnail ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    description:
      featuredItem?.description ||
      "Official agency showreel showcasing commercial edits, visual storytelling, and high-impact digital experiences.",
    client: featuredItem?.client || "Sakil Hub Original",
    featured: true,
    tags: featuredItem?.tags || ["Showreel", "Agency", "4K"],
  };

  const pillBadge = cmsData?.heroPillBadge || "Creative Video • AI • Marketing";
  const headlinePrefix = cmsData?.heroHeadlinePrefix ?? "We Build Powerful ";
  const headlineHighlight = cmsData?.heroHeadlineHighlight ?? "Digital Experiences";
  const headlineSuffix = cmsData?.heroHeadlineSuffix ?? ", Videos & Brands";
  const subtext = cmsData?.heroSubtext || "Turn your ideas into powerful visual stories. We create cinematic videos, AI-powered commercials, and strategic content that helps your brand grow and get real results.";
  const ctaText = cmsData?.heroCtaText || "Explore Our Portfolio";
  const showreelText = cmsData?.heroShowreelText || "Watch Showreel";

  return (
    <section className="relative overflow-hidden bg-[#02050e] min-h-[calc(100vh-70px)] flex flex-col justify-between pt-8 sm:pt-12 lg:pt-14 pb-4 select-none">
      {/* Radiant Electric Blue Atmosphere from Top-Right (Matching Mockup) */}
      <div className="absolute -top-32 -right-32 w-[650px] h-[650px] bg-gradient-to-br from-[#00d2ff]/18 via-[#0066ff]/14 to-transparent blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-[#0055ff]/10 blur-[150px] rounded-full pointer-events-none -z-0" />

      {/* Subtle Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Pill Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 backdrop-blur-xl text-xs font-mono text-zinc-300"
            >
              <div className="w-4 h-4 rounded-full bg-[#00d2ff]/20 flex items-center justify-center">
                <Play className="w-2 h-2 text-[#00d2ff] fill-[#00d2ff] ml-0.5" />
              </div>
              <span className="font-semibold text-white tracking-wide">
                {pillBadge}
              </span>
            </div>

            {/* Main Headline */}
            <div
              className="space-y-2 max-w-2xl"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black text-white tracking-tight leading-[1.2]">
                {headlinePrefix.trimEnd()}{" "}
                <span className="text-[#00d2ff] drop-shadow-[0_0_35px_rgba(0,210,255,0.4)]">
                  {headlineHighlight}
                </span>
                {headlineSuffix}
              </h1>
            </div>

            {/* Subtitle / Value Copy */}
            <p
              className="text-xs sm:text-sm lg:text-base text-zinc-400 max-w-lg leading-relaxed font-normal"
            >
              {subtext}
            </p>

            {/* CTAs Row */}
            <div
              className="flex flex-wrap items-center gap-3.5 pt-1"
            >
              {/* Primary Vibrant Cyan Button */}
              <a
                href="#portfolio"
                className="px-6 sm:px-7 py-3 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.45)] hover:shadow-[0_0_35px_rgba(0,210,255,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              {/* Secondary Dark Glass Pill with Cyan Border */}
              <button
                type="button"
                onClick={() => setShowreelOpen(true)}
                className="px-5 sm:px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                </div>
                <span>{showreelText}</span>
              </button>
            </div>

            {/* Feature / Trust Badges (Row of 3 items from mockup) */}
            <div
              className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/[0.08] max-w-lg"
            >
              {/* 1. High Quality */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-[#00d2ff]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">High Quality</div>
                  <div className="text-[11px] font-mono text-zinc-400">4K/8K Output</div>
                </div>
              </div>

              {/* 2. Fast Delivery */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-[#00d2ff]">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">Fast Delivery</div>
                  <div className="text-[11px] font-mono text-zinc-400">On Time</div>
                </div>
              </div>

              {/* 3. Creative Team */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-[#00d2ff]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-tight">Creative Team</div>
                  <div className="text-[11px] font-mono text-zinc-400 leading-tight">Experts in Visual Storytelling</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D DaVinci Resolve Workstation Mockup */}
          <div className="lg:col-span-5 relative">
            {/* Top Pill Badge above Workstation */}
            <div className="flex justify-end mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[11px] font-mono text-[#00d2ff]">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Turn Ideas ➔ To Impact</span>
              </div>
            </div>

            {/* 3D Tilted Timeline Workstation Mockup */}
            <div
              className="relative rounded-2xl p-2.5 sm:p-3 bg-[#080d1a] border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(0,210,255,0.15)] group"
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-2 pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-mono text-zinc-400">
                    SakilHub_Showreel_2026.drp — 4K DCI
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-zinc-400 uppercase">
                  <span>Media</span>
                  <span>Cut</span>
                  <span className="text-[#00d2ff] font-bold">Edit</span>
                  <span>Fusion</span>
                  <span>Color</span>
                  <span>Fairlight</span>
                </div>
              </div>

              {/* Main Workspace Frame (Preview + Audio Meters) */}
              <div className="grid grid-cols-12 gap-1.5 my-2">
                {/* Left Panel: Media Pool / Project Files */}
                <div className="hidden sm:block sm:col-span-3 rounded-lg bg-black/50 border border-white/[0.06] p-2 space-y-1.5 text-[9.5px] font-mono text-zinc-400">
                  <div className="text-white font-bold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#00d2ff]" />
                    <span>Project Assets</span>
                  </div>
                  <div className="space-y-1 pl-1 text-zinc-400">
                    <div className="text-cyan-300">📁 01_Cinematic_Car.mov</div>
                    <div>📁 02_AI_Commercial.mp4</div>
                    <div>📁 03_Product_Launch.r3d</div>
                    <div>📁 04_Sound_Design_WAV</div>
                  </div>
                </div>

                {/* Center: Cinema Screen Preview */}
                <div className="col-span-12 sm:col-span-8 relative aspect-[16/9] rounded-lg overflow-hidden bg-black border border-white/[0.08]">
                  <Image
                    src={
                      cmsData?.heroWorkstationImage ||
                      featuredItem?.thumbnail ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=720&q=75"
                    }
                    alt="Workstation Preview"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 500px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Play Overlay Button */}
                  <button
                    type="button"
                    onClick={() => setShowreelOpen(true)}
                    aria-label="Play agency showreel"
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-transparent border-0"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#00d2ff]/90 text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.6)] group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </button>

                  {/* Timecode Pill */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-zinc-300 border border-white/10">
                    <span className="text-[#00d2ff] font-bold">TC 01:04:22:18</span>
                    <span>4K 60FPS • ProRes 422 HQ</span>
                  </div>
                </div>

                {/* Right: Audio VU Meter Levels */}
                <div className="hidden sm:flex sm:col-span-1 flex-col justify-between items-center py-1 bg-black/60 rounded-lg border border-white/[0.06]">
                  <div className="h-full w-2 bg-zinc-800 rounded flex flex-col justify-end overflow-hidden p-0.5">
                    <div className="w-full h-3/4 bg-gradient-to-t from-[#00d2ff] via-emerald-400 to-yellow-400 rounded-sm animate-pulse" />
                  </div>
                  <Volume2 className="w-3 h-3 text-[#00d2ff] mt-1" />
                </div>
              </div>

              {/* Bottom: Multitrack Video Editing Timeline */}
              <div className="rounded-lg bg-black/70 border border-white/[0.08] p-2 space-y-1.5 relative overflow-hidden">
                {/* Playhead Red Vertical Marker */}
                <div className="absolute top-0 bottom-0 left-[45%] w-0.5 bg-red-500 shadow-[0_0_8px_red] z-20 pointer-events-none">
                  <div className="w-2 h-2 bg-red-500 rounded-full -ml-[3px] -mt-0.5" />
                </div>

                {/* Timeline Ruler */}
                <div className="flex justify-between text-[8px] font-mono text-zinc-400 border-b border-white/[0.05] pb-0.5">
                  <span>00:00:00</span>
                  <span>00:30:00</span>
                  <span>01:00:00</span>
                  <span>01:30:00</span>
                  <span>02:00:00</span>
                </div>

                {/* Video Tracks (V2 & V1) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-zinc-400 w-4">V2</span>
                    <div className="flex-1 h-3.5 bg-cyan-950/60 rounded border border-cyan-500/30 flex items-center px-1.5">
                      <span className="text-[8px] font-mono text-cyan-300 truncate">Adjustment Layer // Color Grade Teal-Orange</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-zinc-400 w-4">V1</span>
                    <div className="w-1/3 h-4 bg-blue-900/60 rounded border border-blue-500/30 flex items-center px-1.5">
                      <span className="text-[8px] font-mono text-blue-200 truncate">Clip_A.r3d</span>
                    </div>
                    <div className="w-1/2 h-4 bg-cyan-900/60 rounded border border-[#00d2ff]/40 flex items-center px-1.5">
                      <span className="text-[8px] font-mono text-cyan-200 truncate">Cinematic_Shot_02.mov</span>
                    </div>
                  </div>
                </div>

                {/* Audio Tracks (A1 & A2) */}
                <div className="space-y-1 pt-1 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-zinc-400 w-4">A1</span>
                    <div className="flex-1 h-3 bg-emerald-950/60 rounded border border-emerald-500/30 flex items-center px-1">
                      <span className="text-[7.5px] font-mono text-emerald-300">Soundtrack_Cinematic_Bass_Stereo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-zinc-400 w-4">A2</span>
                    <div className="w-2/3 h-3 bg-teal-950/60 rounded border border-teal-500/30 flex items-center px-1">
                      <span className="text-[7.5px] font-mono text-teal-300">SFX_Whoosh_Impact.wav</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pill Badge on Bottom Right of Workstation (From Mockup) */}
              <div className="absolute -bottom-3 -right-3 z-30">
                <div className="px-3.5 py-1.5 rounded-full bg-[#050b18]/90 backdrop-blur-xl border border-[#00d2ff]/50 text-[#00d2ff] text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Powered Creativity</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Smooth Bottom Gradient Blend */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#02050e] via-[#02050e]/60 to-transparent pointer-events-none z-10" />

      {/* Animated Scroll to Explore Indicator */}
      <div className="relative z-20 flex justify-center pt-4 pb-2">
        <a
          href="#portfolio"
          aria-label="Scroll down to portfolio"
          className="inline-flex flex-col items-center gap-1.5 text-zinc-400 hover:text-[#00d2ff] transition-all group cursor-pointer"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 group-hover:text-[#00d2ff] transition-colors">
            Scroll to Explore
          </span>
          <div className="w-5 h-8 rounded-full border border-white/15 group-hover:border-[#00d2ff]/50 flex items-start justify-center p-1 transition-colors">
            <div className="w-1 h-2 rounded-full bg-[#00d2ff] animate-bounce" />
          </div>
        </a>
      </div>

      {/* Global Interactive Video Modal */}
      {showreelOpen && (
        <VideoModal item={showreelItem} onClose={() => setShowreelOpen(false)} />
      )}
    </section>
  );
}


