"use client";

import React from "react";
import { Video, Palette, TrendingUp, Code2, ArrowUpRight, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { AGENCY_SERVICES } from "@/lib/data/services-data";

export default function AgencyServices() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "video":
        return <Video className="w-6 h-6 text-cyan-400" />;
      case "palette":
        return <Palette className="w-6 h-6 text-pink-400" />;
      case "trending-up":
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case "code":
      default:
        return <Code2 className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <section id="services" className="relative py-12 sm:py-20 bg-black select-none">
      {/* Subtle Glows */}
      <div className="absolute top-1/2 left-10 w-80 h-80 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Full-Service Creative Solutions</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Other Specialized Services
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Beyond post-production, we provide end-to-end creative and digital execution to power your business from concept to market domination.
          </p>
        </div>

        {/* 4 Core Agency Services Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {AGENCY_SERVICES.map((service) => (
            <div
              key={service.id}
              className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#0a0e17]/85 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 shadow-xl hover:shadow-[0_15px_45px_rgba(0,0,0,0.8)] flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                {/* Top Header Row */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {getIcon(service.iconName)}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-white/[0.04] text-zinc-300 border border-white/10">
                    {service.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs font-medium text-cyan-400">
                    {service.subtitle}
                  </p>
                </div>

                {/* Detailed Description */}
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {service.description}
                </p>

                {/* Exact Highlighted Bullets requested by User */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Core Capabilities:
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {service.keyBullets.map((bullet, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{bullet}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detailed Deliverables List */}
                <div className="pt-2 space-y-1.5 text-xs text-zinc-300 border-t border-white/5">
                  {service.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct WhatsApp Action for this specific service */}
              <div className="pt-4 border-t border-white/5">
                <a
                  href={`https://wa.me/8801326896947?text=${encodeURIComponent(
                    service.whatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-gradient-to-r hover:from-cyan-400 hover:to-emerald-400 hover:text-black border border-white/10 hover:border-transparent text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquire / Get Quote on WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
