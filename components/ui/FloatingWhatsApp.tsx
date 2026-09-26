"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  hasBottomNav?: boolean;
  hasStickyCta?: boolean;
}

export default function FloatingWhatsApp({
  phoneNumber = "8801326896947",
  hasBottomNav = true,
  hasStickyCta = false,
}: FloatingWhatsAppProps) {
  const [isOpenTooltip, setIsOpenTooltip] = useState(false);

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    "Hello MH Sakil Hub, I have an inquiry about video production / courses / digital assets."
  )}`;

  const getBottomOffset = () => {
    if (hasStickyCta) {
      return "calc(env(safe-area-inset-bottom, 0px) + 84px)";
    }
    if (hasBottomNav) {
      return "calc(env(safe-area-inset-bottom, 0px) + 80px)";
    }
    return "calc(env(safe-area-inset-bottom, 0px) + 20px)";
  };

  return (
    <div
      style={{ bottom: getBottomOffset() }}
      className="fixed right-4 sm:right-6 sm:!bottom-6 z-40 transition-all duration-300 select-none"
    >
      <div className="relative flex items-center group">
        {/* Floating Tooltip / Banner */}
        <div
          className={`hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-[#080d1a]/95 border border-[#00d2ff]/30 text-white text-xs font-semibold shadow-xl backdrop-blur-xl transition-all duration-300 pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Chat on WhatsApp</span>
        </div>

        {/* WhatsApp Glowing Circular FAB Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Direct WhatsApp Contact"
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_35px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group-hover:rotate-6"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />

          {/* SVG WhatsApp Official Icon */}
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white/10 stroke-[2.2]" />

          {/* Online Indicator Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black" />
        </a>
      </div>
    </div>
  );
}
