"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Palette,
  TrendingUp,
  Code2,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  Check,
  MessageCircle,
} from "lucide-react";
import { AGENCY_SERVICES } from "@/lib/data/services-data";

export default function AgencyServices() {
  // Video production open by default
  const [expandedId, setExpandedId] = useState<string>("video-production");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

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
    <section id="services" className="relative py-16 sm:py-24 bg-[#04060b] overflow-hidden select-none">
      {/* Ambient Cinema Lighting */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-cyan-400 text-xs font-mono font-medium tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>02 // CAPABILITIES & SERVICES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Full-Spectrum Creative & Digital Execution
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            Beyond post-production, we provide turnkey creative direction, commercial studio shooting, visual branding, and digital growth infrastructure.
          </p>
        </div>

        {/* Interactive Studio Service Showcase (Refined, Minimal, Zero Chunky Boxes) */}
        <div className="space-y-3.5">
          {AGENCY_SERVICES.map((service, index) => {
            const isExpanded = expandedId === service.id;
            const indexStr = `0${index + 1}`;

            return (
              <motion.div
                key={service.id}
                initial={false}
                className={`rounded-2xl transition-colors duration-300 border ${
                  isExpanded
                    ? "bg-[#090d16] border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.12)]"
                    : "bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                {/* Accordion Trigger Row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(service.id)}
                  className="w-full p-5 sm:p-7 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    {/* Minimalist Index & Tiny Icon */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs sm:text-sm text-zinc-500 font-bold">
                        {indexStr}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        {getSubtleIcon(service.iconName)}
                      </div>
                    </div>

                    {/* Title & Core Subtitle */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-xl font-bold text-white tracking-tight hover:text-cyan-300 transition-colors">
                          {service.title}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                          {service.badge}
                        </span>
                      </div>

                      {/* Quick inline capability pills */}
                      <div className="hidden md:flex items-center gap-2 pt-0.5 text-xs text-zinc-400">
                        <span>{service.subtitle}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {service.keyBullets.join(" • ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Arrow */}
                  <div className="flex items-center gap-3 shrink-0 pl-2 pt-1 sm:pt-0">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400">
                      {isExpanded ? "Collapse" : "Explore"}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-cyan-300 border-cyan-500/40" : ""
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* Expandable Content Drawer */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-7 sm:pb-7 pt-2 border-t border-white/[0.06] space-y-6">
                        {/* Mobile summary info */}
                        <p className="md:hidden text-xs text-zinc-300 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                          {/* Left: Highlighted Core Bullets */}
                          <div className="lg:col-span-7 space-y-3">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                              <span>Exact Service Scope:</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {service.keyBullets.map((bullet, bIdx) => (
                                <span
                                  key={bIdx}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                  <span>{bullet}</span>
                                </span>
                              ))}
                            </div>

                            {/* Detailed Deliverables List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {service.deliverables.map((del, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex items-center gap-2 text-xs text-zinc-300"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">{del}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right: Direct Quote Action */}
                          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col justify-center items-start lg:items-end gap-3 pt-2 lg:pt-0 lg:border-l lg:border-white/[0.06] lg:pl-6">
                            <div className="text-left lg:text-right space-y-0.5">
                              <span className="text-[11px] font-mono text-zinc-400">
                                Ready to commission this service?
                              </span>
                              <div className="text-xs font-bold text-white">
                                Instant Quote via WhatsApp
                              </div>
                            </div>

                            <a
                              href={`https://wa.me/8801326896947?text=${encodeURIComponent(
                                service.whatsappMessage
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-black" />
                              <span>Inquire on WhatsApp</span>
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

