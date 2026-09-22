"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#02050e] text-white px-4 py-16 select-none">
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Stream Interrupted
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            An unexpected glitch occurred while loading this view. You can reload the stream or return to the studio.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-zinc-600">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Stream</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* WhatsApp direct support */}
        <div className="pt-4 border-t border-white/5">
          <a
            href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub,%20I%20encountered%20an%20error%20on%20the%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Report issue to MH Sakil Hub Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
