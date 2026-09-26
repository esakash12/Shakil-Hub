import React from "react";
import { Sparkles } from "lucide-react";

// --- Authentic Creative & AI Brand Vector Marks ---

const DaVinciIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C8 6 6 9 8 13C9.5 10 11 9 12 9C12 9 13 12 11 15C13 14 15 12 16 9C14.5 12 15 15 13.5 18C16.5 17 19 14.5 20 12C18 13 16 13 15 11C18 10 19 8 20 5C17 6 15 6 13 4C14 7 12 8 10 7C11 5 12 3 12 2Z" opacity="0.9" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const PremiereIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#00005B" />
    <text x="4" y="16.5" fill="#9999FF" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif">Pr</text>
  </svg>
);

const AfterEffectsIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect width="24" height="24" rx="5" fill="#00005B" />
    <text x="3.5" y="16.5" fill="#9999FF" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif">Ae</text>
  </svg>
);

const MidjourneyIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 3L11 8.5L14.5 11.5L18.5 7L13.5 3Z" opacity="0.85" />
    <path d="M5.5 13.5L8.5 18.5L19 18.5L16 13.5L5.5 13.5Z" />
    <path d="M9.5 9L5 13L15 13L12 9H9.5Z" opacity="0.7" />
  </svg>
);

const RunwayIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4 4h7a5 5 0 0 1 5 5c0 2.2-1.4 4-3.4 4.7L18 20h-4.5l-4.5-5.5H8v5.5H4V4zm4 3.5v3.5h3a1.75 1.75 0 1 0 0-3.5H8z" />
  </svg>
);

const UnrealEngineIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8.5 7.5L12 14.5L15.5 7.5H18L13.5 17H10.5L6 7.5H8.5Z" />
  </svg>
);

const BlenderIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <circle cx="13" cy="13" r="3.5" />
    <path d="M13 5a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 13.5A5.5 5.5 0 1 1 18.5 13 5.5 5.5 0 0 1 13 18.5z" />
    <path d="M5 6l4.5 3M3 13h5M5 20l4.5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TopazIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const ElevenLabsIcon = ({ className = "w-4 h-4 shrink-0" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="5" y="4" width="3.5" height="16" rx="1.75" />
    <rect x="11" y="8" width="3.5" height="12" rx="1.75" />
    <rect x="17" y="2" width="3.5" height="18" rx="1.75" />
  </svg>
);

interface TechTool {
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TECH_TOOLS: TechTool[] = [
  {
    name: "DaVinci Resolve Studio 19",
    category: "Color Grading & Editing",
    icon: DaVinciIcon,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Adobe Premiere Pro",
    category: "Professional NLE",
    icon: PremiereIcon,
    color: "from-purple-500 to-indigo-600",
  },
  {
    name: "Adobe After Effects",
    category: "VFX & Motion Design",
    icon: AfterEffectsIcon,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Midjourney v6",
    category: "Generative AI Art",
    icon: MidjourneyIcon,
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Runway Gen-3 Alpha",
    category: "AI Video Synthesis",
    icon: RunwayIcon,
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Unreal Engine 5",
    category: "Real-Time 3D & Virtual",
    icon: UnrealEngineIcon,
    color: "from-amber-400 to-orange-500",
  },
  {
    name: "Blender 3D",
    category: "3D Animation & CGI",
    icon: BlenderIcon,
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Topaz Video AI",
    category: "Neural 4K/8K Upscaling",
    icon: TopazIcon,
    color: "from-cyan-400 to-emerald-400",
  },
  {
    name: "ElevenLabs AI",
    category: "Voice & Audio Synthesis",
    icon: ElevenLabsIcon,
    color: "from-blue-400 to-purple-500",
  },
];

export default function TechStackMarquee() {
  return (
    <div className="relative py-8 bg-[#02050e] border-y border-white/[0.06] overflow-hidden select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[150px] bg-[#00d2ff]/5 blur-[120px] pointer-events-none -z-0" />

      {/* Top Micro Label */}
      <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-[#00d2ff]/20 text-[10.5px] font-mono text-zinc-400 tracking-wider">
          <Sparkles className="w-3 h-3 text-[#00d2ff]" />
          <span>PRODUCTION PIPELINE • INDUSTRY-STANDARD SOFTWARE & AI</span>
        </div>
      </div>

      {/* Marquee Track with Left & Right Gradient Fade Masks */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max hover:[animation-play-state:paused]">
          {/* Primary Track */}
          <div className="flex gap-4 sm:gap-6 animate-marquee shrink-0 pr-4 sm:pr-6">
            {TECH_TOOLS.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={`tool-1-${idx}`}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#070b16] border border-white/[0.08] hover:border-[#00d2ff]/40 shadow-sm hover:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all shrink-0 cursor-default group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} p-[1px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <div className="w-full h-full rounded-[11px] bg-[#070b16] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white shrink-0" />
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-[#00d2ff] transition-colors leading-tight">
                      {tool.name}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 leading-tight">
                      {tool.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tandem Secondary Track (Eliminates all gaps and snaps) */}
          <div className="flex gap-4 sm:gap-6 animate-marquee shrink-0 pr-4 sm:pr-6" aria-hidden="true">
            {TECH_TOOLS.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={`tool-2-${idx}`}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#070b16] border border-white/[0.08] hover:border-[#00d2ff]/40 shadow-sm hover:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all shrink-0 cursor-default group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} p-[1px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <div className="w-full h-full rounded-[11px] bg-[#070b16] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white shrink-0" />
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-[#00d2ff] transition-colors leading-tight">
                      {tool.name}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 leading-tight">
                      {tool.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
