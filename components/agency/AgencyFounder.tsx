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
    <section id="about-founder" className="relative py-12 sm:py-16 bg-[#02050e] select-none overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00d2ff]/6 blur-[160px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Founder Photo Card with Neon Signature */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.1)]">
              {/* Black & White Portrait Photo */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt="Mehedi Hasan Sakil"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-transparent" />

                {/* Floating Neon Cyan Signature: Sakil */}
                <div className="absolute bottom-3 right-4 select-none pointer-events-none">
                  <span className="font-serif italic font-normal text-2xl text-[#00d2ff] opacity-90 drop-shadow-[0_0_12px_rgba(0,210,255,0.8)] tracking-wider">
                    Sakil
                  </span>
                </div>
              </div>

              {/* Founder Name Strip */}
              <div className="p-4 bg-[#070b16] flex items-center justify-between border-t border-white/[0.06]">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Mehedi Hasan Sakil
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Director & Founder
                </span>
              </div>
            </div>

            {/* Social Media Circular Links Row */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold font-mono">f</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="Instagram"
              >
                <span className="text-xs font-bold font-mono">ig</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="YouTube"
              >
                <span className="text-xs font-bold font-mono">yt</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="LinkedIn"
              >
                <span className="text-xs font-bold font-mono">in</span>
              </a>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Stats Bar */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-medium tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>✦ ABOUT ME</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-tight">
              Directed by <span className="text-[#00d2ff]">Mehedi Hasan Sakil</span>
            </h2>

            {/* Bio Narrative from Mockup */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              I&apos;m a video content creator and creative director, passionate about turning ideas into powerful visual stories. With years of experience in video production, design and digital marketing, I help brands grow through creativity and strategy.
            </p>

            {/* Single Horizontal Stats Card with 4 Metrics (From Mockup) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#070b16] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x-0 sm:divide-x divide-white/[0.06]">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">5+</div>
                <div className="text-[11px] font-mono text-zinc-400">Years Experience</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">100+</div>
                <div className="text-[11px] font-mono text-zinc-400">Projects Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">50+</div>
                <div className="text-[11px] font-mono text-zinc-400">Happy Clients</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">98%</div>
                <div className="text-[11px] font-mono text-zinc-400">Client Satisfaction</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


