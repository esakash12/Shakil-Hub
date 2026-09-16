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
    <section id="services" className="relative py-10 sm:py-14 bg-[#030508] overflow-hidden select-none">
      {/* Ambient Cinema Lighting */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-600/8 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/8 blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
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

        {/* Balanced 2x2 Bento Grid (Clean Luxury Glass Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {AGENCY_SERVICES.map((service, index) => {
            const indexStr = `0${index + 1}`;

            return (
              <div
                key={service.id}
                className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between space-y-6 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden"
              >
                {/* Ambient Card Corner Glow on hover */}
                <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  {/* Card Top Row: Index & Category Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        {getSubtleIcon(service.iconName)}
                      </div>
                      <span className="font-mono text-xs text-zinc-400 font-semibold tracking-wider">
                        {indexStr} // SERVICE
                      </span>
                    </div>

                    <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-normal text-zinc-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Highlighted Bullets formatted as soft pill chips */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      Specialized Scope
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {service.keyBullets.map((bullet, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{bullet}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables Checklist (clean & uncluttered) */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    {service.deliverables.slice(0, 3).map((del, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span className="truncate">{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button: Modern Pill Button */}
                <div className="pt-3 border-t border-white/[0.06] relative z-10">
                  <a
                    href={`https://wa.me/8801326896947?text=${encodeURIComponent(
                      service.whatsappMessage
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-full bg-white/[0.04] hover:bg-gradient-to-r hover:from-cyan-400 hover:via-teal-300 hover:to-emerald-400 hover:text-black border border-white/[0.1] hover:border-transparent text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer hover:scale-[1.02]"
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


