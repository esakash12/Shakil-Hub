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
import CursorSpotlight from "@/components/ui/CursorSpotlight";
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
    <section id="services" className="relative py-12 sm:py-16 bg-[#02050e] overflow-hidden select-none">
      {/* Ambient Cinema Lighting */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#00d2ff]/8 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0066ff]/8 blur-[140px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-medium tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ OUR SERVICES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Specialized <span className="text-[#00d2ff]">Creative Services</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            From concept to final cut, we offer end-to-end video production and creative services to bring your vision to life.
          </p>
        </div>

        {/* Balanced 2x2 Bento Grid with Desktop Spotlight (Matching Mockup) */}
        <CursorSpotlight>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {AGENCY_SERVICES.map((service) => {
              return (
                <div
                  key={service.id}
                  data-spotlight-card
                  className="relative rounded-2xl p-5 sm:p-7 bg-[#070b16] border border-white/[0.08] hover:border-[#00d2ff]/40 transition-all duration-300 flex flex-col justify-between space-y-4 sm:space-y-5 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(0,210,255,0.1)] overflow-hidden"
                >
                  {/* Desktop Hardware-Accelerated Spotlight Overlay */}
                  <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0 bg-[radial-gradient(350px_circle_at_var(--mouse-x,0)_var(--mouse-y,0),rgba(0,210,255,0.12),transparent_40%)] hidden md:block" />

                  <div className="space-y-3.5 sm:space-y-4">
                    {/* Circular Cyan Icon Badge */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)] group-hover:scale-105 transition-transform">
                      {getSubtleIcon(service.iconName)}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-[#00d2ff] transition-colors tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-normal text-zinc-400 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* 4 Checklist Bullets with Cyan Checkmarks */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.05]">
                      {service.keyBullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-[#00d2ff] shrink-0 stroke-[2.5]" />
                          <span className="truncate">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Learn More ➔ Link */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end">
                    <a
                      href={`https://wa.me/8801326896947?text=${encodeURIComponent(
                        service.whatsappMessage
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      <span>Learn More</span>
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CursorSpotlight>
      </div>
    </section>
  );
}


