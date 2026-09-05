import React from "react";
import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="h-14 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Headless LMS Mode</span>
        </span>
        <span className="hidden sm:inline-block text-xs text-gray-500">
          • Medusa v2 Backend Engine Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </header>
  );
}
