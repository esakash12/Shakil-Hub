"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  Briefcase,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  Bot,
  Calendar,
} from "lucide-react";
import { FOUNDER_DATA } from "@/lib/data/founder-data";

export default function AgencyFounder() {
  return (
    <section id="about-founder" className="relative py-16 sm:py-24 bg-[#030508] select-none overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/6 blur-[160px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-cyan-400 text-xs font-mono font-medium tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>03 // CREATIVE LEADERSHIP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Directed by Mehedi Hasan Sakil
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            The visionary orchestrating high-retention commercial video production and AI visual storytelling across national and global brands.
          </p>
        </div>

        {/* Balanced Editorial Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Portrait & Roles (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#070a11] border border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Portrait Frame with Ambient Vignette */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt={FOUNDER_DATA.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Director Location Pill */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-[11px] font-mono">
                  <span className="text-white font-bold">{FOUNDER_DATA.name}</span>
                  <span className="text-cyan-400 font-semibold">BANANI, DHAKA</span>
                </div>
              </div>

              {/* Verified Title */}
              <div className="space-y-1">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  Professional Identity
                </div>
                <div className="text-sm font-bold text-white">
                  Digital Creator • Commercial Video Editor • AI Visualist
                </div>
              </div>

              {/* Verified Positions List */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Active Management Roles:
                </div>
                <div className="space-y-1.5">
                  {FOUNDER_DATA.currentPositions.map((pos, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2.5 text-xs text-zinc-200"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-medium text-[11.5px]">{pos}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Connect Action */}
            <a
              href={`https://wa.me/880${FOUNDER_DATA.whatsappNumber}?text=${encodeURIComponent(
                "Hello Sakil ভাই! I would like to consult with you directly regarding a video or digital project."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-white/[0.03] hover:bg-gradient-to-r hover:from-cyan-400 hover:to-emerald-400 hover:text-black border border-white/[0.08] hover:border-transparent text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct WhatsApp with Sakil</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column: Bio Narrative & Expertise (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Top Story Card */}
            <div className="rounded-2xl bg-[#070a11] border border-white/[0.08] p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                  Track Record & Evolution
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Active Since 2018 (6+ Years)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Entering the digital industry in 2018, Sakil developed an extensive foundation in cybersecurity, web development, and digital marketing before committing his primary focus to{" "}
                <strong className="text-white font-semibold">advanced commercial video editing</strong> for more than four years. Today, he pioneers{" "}
                <strong className="text-cyan-400 font-semibold">Artificial Intelligence (AI) and AI-powered video production</strong>, giving brands cinematic visuals with accelerated turnarounds.
              </p>

              {/* Founder Quote Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] relative">
                <p className="text-xs sm:text-sm italic text-zinc-300 leading-relaxed font-normal">
                  &ldquo;{FOUNDER_DATA.quote}&rdquo;
                </p>
                <div className="mt-2 text-[10.5px] font-mono text-cyan-400 uppercase tracking-wider">
                  — Mehedi Hasan Sakil, Founder & CEO
                </div>
              </div>

              {/* Minimalist Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {FOUNDER_DATA.stats.map((st, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-0.5">
                    <div className="text-sm sm:text-base font-black text-white font-mono">{st.value}</div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">{st.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: Journey Stages & Skill Arsenal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Evolution Milestones */}
              <div className="rounded-xl bg-[#070a11] border border-white/[0.08] p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Strategic Evolution</span>
                </div>
                <div className="space-y-1.5 text-xs text-zinc-300">
                  {FOUNDER_DATA.journeyStages.map((stage, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Skill Tags */}
              <div className="rounded-xl bg-[#070a11] border border-white/[0.08] p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Core Expertise</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FOUNDER_DATA.coreCompetencies.map((skill, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.03] border border-white/[0.05] text-zinc-300 hover:text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


