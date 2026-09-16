"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import VideoModal from "./VideoModal";
import { PORTFOLIO_ITEMS } from "@/lib/data/portfolio";

export default function AgencyAcademyPreview() {
  const [demoOpen, setDemoOpen] = useState(false);
  const demoItem = PORTFOLIO_ITEMS[4] || PORTFOLIO_ITEMS[0];

  const studentAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  ];

  return (
    <section className="relative py-12 sm:py-16 bg-[#02050e] border-t border-white/[0.06] select-none overflow-hidden">
      {/* Curved Deep Blue Radial Background */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[300px] bg-[#0055ff]/10 blur-[130px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl p-6 sm:p-9 lg:p-10 bg-gradient-to-r from-[#060b18] via-[#081022] to-[#060b18] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">
            
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>✦ TESTIMONIALS</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Want to Master the Craft? <br />
                We Teach What We <span className="text-[#00d2ff]">Practice</span> <br />
                in the Agency.
              </h3>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal max-w-xl">
                Learn directly from real-world projects, not just theory. Join our creative courses and build your skills with industry experience.
              </p>
            </div>

            {/* Right Column: Social Proof & Actions */}
            <div className="lg:col-span-5 flex flex-col sm:items-end space-y-4">
              {/* Overlapping Student Avatars & Star Rating */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {studentAvatars.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-8 h-8 rounded-full border-2 border-[#070b16] overflow-hidden"
                    >
                      <Image
                        src={src}
                        alt="Student Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white font-mono ml-1">4.9/5</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    Trusted by 100+ students
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/courses"
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Explore Web Courses</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/30 hover:border-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Video Modal for Demo */}
      {demoOpen && (
        <VideoModal item={demoItem} onClose={() => setDemoOpen(false)} />
      )}
    </section>
  );
}
