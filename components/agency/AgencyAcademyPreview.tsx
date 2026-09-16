"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Check, ShoppingBag } from "lucide-react";

export default function AgencyAcademyPreview() {
  return (
    <section className="relative py-8 sm:py-12 bg-[#030407] border-t border-white/[0.06] select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-9 lg:p-10 overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-xl backdrop-blur-xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-cyan-400 text-xs font-mono font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>05 // SAKIL HUB ACADEMY</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Want to Master the Craft? We Teach What We Practice in the Agency.
              </h3>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Master advanced commercial video editing, Premiere & After Effects workflows, and AI visual tools directly with industry practitioners.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                  <span>Beginner to Advanced Masterclasses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                  <span>Verified Completion Certificates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                  <span>Lifetime Project File Access</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/courses"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-105 transition-all cursor-pointer"
              >
                <span>Explore Masterclasses</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Digital Shop</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
