import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-[#02050e] text-white px-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Ambient Pulsing Glow */}
        <div className="absolute w-28 h-28 bg-[#00d2ff]/20 rounded-full blur-2xl animate-pulse" />
        {/* Double Ring Cinema Spinner */}
        <div className="w-14 h-14 rounded-full border-2 border-white/10 border-t-[#00d2ff] animate-spin" />
        <div className="absolute w-8 h-8 rounded-full border border-white/5 border-b-[#0066ff] animate-spin [animation-direction:reverse]" />
      </div>
      <div className="mt-5 space-y-1.5 text-center">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d2ff]">
          Sakil Hub Studio
        </p>
        <p className="text-[11px] text-zinc-500 font-mono">
          Streaming cinematic assets...
        </p>
      </div>
    </div>
  );
}
