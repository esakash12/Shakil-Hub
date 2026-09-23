"use client";

import React, { useState, useEffect } from "react";
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
import { AgencyCmsData } from "@/lib/data/agency-cms-types";
import { getPlatformBrandingAction } from "@/lib/actions/branding";
import { PlatformBrandingSettings, DEFAULT_BRANDING } from "@/lib/data/branding-types";

export default function AgencyFounder({ cmsData }: { cmsData?: AgencyCmsData }) {
  const [branding, setBranding] = useState<PlatformBrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    let isMounted = true;
    async function loadBrand() {
      try {
        const data = await getPlatformBrandingAction();
        if (isMounted && data) {
          setBranding(data);
        }
      } catch {}
    }
    loadBrand();
    return () => {
      isMounted = false;
    };
  }, []);
  const photoUrl = cmsData?.founderPhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
  const name = cmsData?.founderName || "MH Sakil";
  const signature = cmsData?.founderSignatureText || "";
  const headline = cmsData?.founderHeadline || "Directed by MH Sakil";
  const subheading = cmsData?.founderSubheading || "Founder & CEO, Sakil Hub.";
  const bio = cmsData?.founderBio1 || "I'm a video content creator and creative director, passionate about turning ideas into powerful visual stories. With years of experience in video production, design and digital marketing, I help brands grow through creativity and strategy.";
  const bio2 = cmsData?.founderBio2 || "Today, I lead Sakil Hub — creating high-impact visual narratives, AI-powered commercials, and digital branding assets for global clients and high-growth businesses.";
  const stat1Val = cmsData?.founderStat1Value || "5+";
  const stat1Lbl = cmsData?.founderStat1Label || "Years Experience";
  const stat2Val = cmsData?.founderStat2Value || "100+";
  const stat2Lbl = cmsData?.founderStat2Label || "Projects Completed";
  const stat3Val = cmsData?.founderStat3Value || "50+";
  const stat3Lbl = cmsData?.founderStat3Label || "Happy Clients";
  const stat4Val = cmsData?.founderStat4Value || "98%";
  const stat4Lbl = cmsData?.founderStat4Label || "Client Satisfaction";

  return (
    <section id="about-founder" className="relative py-12 sm:py-16 bg-[#02050e] select-none overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00d2ff]/6 blur-[160px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Founder Photo Card with Neon Signature */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start space-y-3">
            <div className="w-full max-w-[320px] sm:max-w-[350px] relative rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.1)]">
              {/* Full Natural Color Portrait Container (Fit Without Crop) */}
              <div className="relative w-full aspect-[4/5] max-h-[350px] sm:max-h-[380px] overflow-hidden bg-[#050812] flex items-center justify-center">
                {/* Ambient Soft Blurred Glow Backdrop to gracefully fill any aspect ratio letterbox */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,210,255,0.15),transparent_70%)] pointer-events-none select-none" />

                {/* Foreground Uncropped Full-Color Image */}
                <div className="relative w-full h-full p-2 sm:p-3 flex items-center justify-center z-[1]">
                  <Image
                    src={photoUrl}
                    alt={name}
                    fill
                    unoptimized={Boolean(photoUrl?.startsWith('/api/r2/') || photoUrl?.includes('r2.cloudflarestorage.com'))}
                    sizes="(max-width: 640px) 280px, 350px"
                    className="object-contain object-center transition-transform duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>

                {/* Subtle Bottom Vignette */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#070b16] via-[#070b16]/60 to-transparent pointer-events-none z-[2]" />

                {/* Floating Neon Cyan Signature (only if signature text is provided) */}
                {signature && (
                  <div className="absolute bottom-3 right-4 select-none pointer-events-none z-[3]">
                    <span className="font-serif italic font-normal text-2xl text-[#00d2ff] opacity-90 drop-shadow-[0_0_12px_rgba(0,210,255,0.8)] tracking-wider">
                      {signature}
                    </span>
                  </div>
                )}
              </div>

              {/* Founder Name Strip */}
              <div className="px-3.5 py-2.5 bg-[#070b16] flex items-center justify-between border-t border-white/[0.06]">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {name}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {subheading}
                </span>
              </div>
            </div>

            {/* Social Media Circular Links Row */}
            <div className="flex items-center gap-2.5">
              <a
                href={branding.facebookUrl || "https://facebook.com/sakilhub"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="Facebook"
              >
                <span className="text-xs font-bold font-mono">f</span>
              </a>
              <a
                href={branding.instagramUrl || "https://instagram.com/sakilhub"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="Instagram"
              >
                <span className="text-xs font-bold font-mono">ig</span>
              </a>
              <a
                href={branding.youtubeUrl || "https://youtube.com/@sakilhub"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                aria-label="YouTube"
              >
                <span className="text-xs font-bold font-mono">yt</span>
              </a>
              <a
                href={branding.linkedinUrl || "https://linkedin.com/company/sakilhub"}
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
              {headline}
            </h2>

            {/* Bio Narrative */}
            <div className="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              <p className="whitespace-pre-line">{bio}</p>
              {bio2 && <p className="text-zinc-400 whitespace-pre-line">{bio2}</p>}
            </div>

            {/* Single Horizontal Stats Card with 4 Metrics */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#070b16] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x-0 sm:divide-x divide-white/[0.06]">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{stat1Val}</div>
                <div className="text-[11px] font-mono text-zinc-400">{stat1Lbl}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{stat2Val}</div>
                <div className="text-[11px] font-mono text-zinc-400">{stat2Lbl}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{stat3Val}</div>
                <div className="text-[11px] font-mono text-zinc-400">{stat3Lbl}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black text-white font-mono">{stat4Val}</div>
                <div className="text-[11px] font-mono text-zinc-400">{stat4Lbl}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


