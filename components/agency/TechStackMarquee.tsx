import React from "react";
import {
  Sparkles,
  Film,
  Layers,
  Wand2,
  Boxes,
  Cpu,
  Tv,
  Zap,
  Flame,
  Bot,
} from "lucide-react";

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
    icon: Film,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Adobe Premiere Pro",
    category: "Professional NLE",
    icon: Tv,
    color: "from-purple-500 to-indigo-600",
  },
  {
    name: "Adobe After Effects",
    category: "VFX & Motion Design",
    icon: Layers,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Midjourney v6",
    category: "Generative AI Art",
    icon: Wand2,
    color: "from-pink-500 to-rose-600",
  },
  {
    name: "Runway Gen-3 Alpha",
    category: "AI Video Synthesis",
    icon: Bot,
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Unreal Engine 5",
    category: "Real-Time 3D & Virtual",
    icon: Boxes,
    color: "from-amber-400 to-orange-500",
  },
  {
    name: "Blender 3D",
    category: "3D Animation & CGI",
    icon: Flame,
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Topaz Video AI",
    category: "Neural 4K/8K Upscaling",
    icon: Cpu,
    color: "from-cyan-400 to-emerald-400",
  },
  {
    name: "ElevenLabs AI",
    category: "Voice & Audio Synthesis",
    icon: Zap,
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
                      <Icon className="w-4 h-4 text-white" />
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
                      <Icon className="w-4 h-4 text-white" />
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
