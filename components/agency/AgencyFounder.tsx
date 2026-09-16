"use client";

import React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Sparkles,
  Award,
  Film,
  Briefcase,
  Bot,
  ArrowRight,
  MessageCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { FOUNDER_DATA } from "@/lib/data/founder-data";

export default function AgencyFounder() {
  return (
    <section id="about-founder" className="relative py-14 sm:py-24 bg-[#06080e] select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
        {/* Section Pill & Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Creative Leadership & Authority</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Meet the Creative Director
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            The visionary driving high-conversion video production and AI content creation across national and international brands.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Left Column: Creator Identity Card (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl sm:rounded-3xl p-6 bg-[#0a0d16]/90 border border-white/10 flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="space-y-5">
              {/* Creator Photo / Avatar */}
              <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-900/40 to-slate-900 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex items-center justify-center">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt={FOUNDER_DATA.name}
                  fill
                  sizes="(max-width: 768px) 260px, 320px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Active Availability Badge */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10.5px] font-semibold text-emerald-300 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Open for Direct Commercial Booking</span>
                </div>
              </div>

              {/* Identity Details */}
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {FOUNDER_DATA.name}
                </h3>
                <p className="text-xs font-semibold text-cyan-400">
                  Digital Creator • Video Editor • AI Creator
                </p>
                <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 pt-1">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{FOUNDER_DATA.location}</span>
                </div>
              </div>

              {/* Active Roles Pill Badges */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-[10.5px] uppercase font-bold text-zinc-400 tracking-wider text-center">
                  Current Roles & Responsibilities:
                </div>
                <div className="space-y-1.5 text-xs">
                  {FOUNDER_DATA.currentPositions.map((pos, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2 text-zinc-200"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Direct WhatsApp with Sakil</span>
            </a>
          </div>

          {/* Right Column: Experience, Philosophy & Skills (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
            {/* Top Card: The Creative Journey & Narrative */}
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#0a0d16]/90 border border-white/10 space-y-4 shadow-xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                    Background & Track Record
                  </div>
                  <h4 className="text-lg sm:text-xl font-extrabold text-white">
                    6+ Years of Digital Mastery & Innovation
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Active Since 2018
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Starting in 2018 with deep exploration in cybersecurity and digital marketing, Sakil systematically honed{" "}
                <strong className="text-white font-semibold">advanced commercial video editing</strong> as his core craft for more than four years. Today, he pioneers{" "}
                <strong className="text-cyan-400 font-semibold">Artificial Intelligence (AI) and AI-powered video production</strong>, blending cutting-edge technology with cinematic storytelling.
              </p>

              {/* Founder Quote Card */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-950/30 to-black border border-cyan-500/20 relative">
                <p className="text-xs sm:text-sm italic text-cyan-100/90 leading-relaxed font-medium">
                  &ldquo;{FOUNDER_DATA.quote}&rdquo;
                </p>
                <div className="mt-2 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  — Mehedi Hasan Sakil, Founder & CEO
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {FOUNDER_DATA.stats.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                    <div className="text-sm sm:text-base font-black text-white font-mono">{st.value}</div>
                    <div className="text-[10.5px] text-zinc-400">{st.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 2 Bento Cards: Journey Timeline & Core Arsenal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Journey Timeline */}
              <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-[#0a0d16]/90 border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Strategic Evolution</span>
                </div>
                <div className="space-y-1.5">
                  {FOUNDER_DATA.journeyStages.map((stage, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-mono font-bold shrink-0">
                        {sIdx + 1}
                      </span>
                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Skill Arsenal */}
              <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-[#0a0d16]/90 border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Core Expertise & Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FOUNDER_DATA.coreCompetencies.map((skill, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white transition-colors"
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
