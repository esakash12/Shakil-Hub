import React from "react";
import Link from "next/link";
import { Film, Home, PlaySquare, ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-[#02050e] text-white px-4 py-16 select-none overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#00d2ff]/10 blur-[150px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#0066ff]/8 blur-[130px] rounded-full pointer-events-none -z-0" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Film Slate Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-bold tracking-widest shadow-lg">
          <Film className="w-3.5 h-3.5" />
          <span>TAKE 404 • SCENE NOT FOUND</span>
        </div>

        {/* Big Glitch 404 Title */}
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-white">
            4<span className="text-[#00d2ff] drop-shadow-[0_0_25px_rgba(0,210,255,0.6)]">0</span>4
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-200">
            Cut From The Final Reel
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            The page, project, or video reel you were looking for doesn't exist or has been moved to our archives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Back to Studio</span>
          </Link>

          <Link
            href="/courses"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <PlaySquare className="w-4 h-4 text-[#00d2ff]" />
            <span>Explore Courses</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Digital Assets</span>
          </Link>
        </div>

        {/* Quick Assistance Cue */}
        <p className="text-[11px] text-zinc-500 font-mono pt-4">
          Need immediate help? WhatsApp us at{" "}
          <a
            href="https://wa.me/8801326896947"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d2ff] underline hover:text-white transition-colors"
          >
            +880 1326-896947
          </a>
        </p>
      </div>
    </div>
  );
}
