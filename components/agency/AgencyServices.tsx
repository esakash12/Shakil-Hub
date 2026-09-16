"use client";

import React from "react";
import {
  Video,
  Palette,
  TrendingUp,
  Code2,
  ArrowUpRight,
  Sparkles,
  Check,
  MessageCircle,
} from "lucide-react";
import { AGENCY_SERVICES } from "@/lib/data/services-data";

export default function AgencyServices() {
  const getSubtleIcon = (iconName: string) => {
    const iconClass = "w-4 h-4 text-cyan-400 stroke-[1.8]";
    switch (iconName) {
      case "video":
        return <Video className={iconClass} />;
      case "palette":
        return <Palette className={iconClass} />;
      case "trending-up":
        return <TrendingUp className={iconClass} />;
      case "code":
      default:
        return <Code2 className={iconClass} />;
    }
  };

  return (
    <section id="services" className="relative py-16 sm:py-24 bg-[#030508] overflow-hidden select-none">
      {/* Ambient Cinema Lighting */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-600/8 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/8 blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-cyan-400 text-xs font-mono font-medium tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>02 // CAPABILITIES & SERVICES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Specialized Creative Services
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Beyond post-production, we provide end-to-end commercial cinema shooting, visual branding, and digital growth infrastructure.
          </p>
        </div>

        {/* Balanced 2x2 Bento Grid (4 Equal-Height, Beautifully Spaced Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {AGENCY_SERVICES.map((service, index) => {
            const indexStr = `0${index + 1}`;

            return (
              <div
                key={service.id}
                className="rounded-2xl p-6 sm:p-7 bg-[#070a11] border border-white/[0.08] hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between space-y-5 group hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
              >
                <div className="space-y-4">
                  {/* Card Top Row: Index & Category Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-zinc-500 font-bold">
                        {indexStr} //
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        {getSubtleIcon(service.iconName)}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-white/[0.03] text-zinc-400 border border-white/[0.06]">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs font-normal text-zinc-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Exact Highlighted Bullets requested by User */}
                  <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                    <div className="text-[10.5px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      Core Scope:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.keyBullets.map((bullet, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{bullet}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                    {service.deliverables.slice(0, 3).map((del, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button: Direct WhatsApp Inquiry */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <a
                    href={`https://wa.me/8801326896947?text=${encodeURIComponent(
                      service.whatsappMessage
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-gradient-to-r hover:from-cyan-400 hover:to-emerald-400 hover:text-black border border-white/[0.08] hover:border-transparent text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Inquire for {service.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


