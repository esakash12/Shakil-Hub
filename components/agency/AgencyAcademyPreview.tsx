"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Sparkles, CheckCircle2, Play } from "lucide-react";

export default function AgencyAcademyPreview() {
  return (
    <section className="relative py-12 sm:py-16 bg-[#070a12] border-t border-white/5 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-r from-blue-950/40 via-[#0e1322] to-cyan-950/30 border border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Sakil Hub Creative Academy</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Want to Learn the Craft? We Teach Exactly What We Practice in the Agency.
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Master advanced video editing, CapCut Pro workflows, speed ramping, audio foley, and cinematic color science directly from industry-active practitioners.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Beginner to Advanced Masterclasses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified Completion Certificates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Lifetime Project File Access</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/courses"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Explore Masterclasses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="px-5 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Digital Asset Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
