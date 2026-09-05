"use client";

import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  PaymentGatewayType,
  BkashLogo,
  NagadLogo,
  RocketLogo,
} from "./ThemedPaymentGateway";

interface PaymentGatewaySelectorProps {
  onSelect: (gateway: PaymentGatewayType) => void;
  onBackToDetails: () => void;
  customerName?: string;
  payableAmount: string;
}

export default function PaymentGatewaySelector({
  onSelect,
  onBackToDetails,
  customerName,
  payableAmount,
}: PaymentGatewaySelectorProps) {
  const gateways: {
    id: PaymentGatewayType;
    name: string;
    bengaliName: string;
    subtitle: string;
    badge: string;
    logo: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderColor: string;
    hoverBorderColor: string;
    glowShadow: string;
    pillBg: string;
    badgeColor: string;
  }[] = [
    {
      id: "bkash",
      name: "bKash",
      bengaliName: "বিকাশ",
      subtitle: "Personal Send Money • Instant Confirmation",
      badge: "Most Popular",
      logo: BkashLogo,
      accentColor: "#E2136E",
      borderColor: "border-[#E2136E]/40",
      hoverBorderColor: "hover:border-[#E2136E]",
      glowShadow: "hover:shadow-[0_10px_30px_rgba(226,19,110,0.25)]",
      pillBg: "bg-[#E2136E]/15 text-[#E2136E]",
      badgeColor: "bg-[#E2136E] text-white",
    },
    {
      id: "nagad",
      name: "Nagad",
      bengaliName: "নগদ",
      subtitle: "Personal Send Money • Lowest Cashout Fee",
      badge: "Fast & Reliable",
      logo: NagadLogo,
      accentColor: "#F37021",
      borderColor: "border-[#F37021]/40",
      hoverBorderColor: "hover:border-[#F37021]",
      glowShadow: "hover:shadow-[0_10px_30px_rgba(243,112,33,0.25)]",
      pillBg: "bg-[#F37021]/15 text-[#F37021]",
      badgeColor: "bg-[#F37021] text-white",
    },
    {
      id: "rocket",
      name: "Rocket (DBBL)",
      bengaliName: "রকেট",
      subtitle: "Dutch-Bangla Bank Mobile Banking",
      badge: "Bank Grade",
      logo: RocketLogo,
      accentColor: "#8C1595",
      borderColor: "border-[#8C1595]/40",
      hoverBorderColor: "hover:border-[#8C1595]",
      glowShadow: "hover:shadow-[0_10px_30px_rgba(140,21,149,0.25)]",
      pillBg: "bg-[#8C1595]/15 text-[#8C1595]",
      badgeColor: "bg-[#8C1595] text-white",
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-white/15 bg-[#0e1320]/95 backdrop-blur-2xl p-6 sm:p-7 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.75)] animate-in fade-in duration-300">
      {/* Header with Step Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step 2 of 2: Payment Gateway</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              Payable Total
            </span>
            <span className="text-lg font-black font-mono text-cyan-400">
              {payableAmount}
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Select Your Payment Method
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {customerName ? (
            <>
              Paying as <strong className="text-white">{customerName}</strong>.
            </>
          ) : null}{" "}
          Choose your preferred mobile banking wallet below to proceed to the secure transaction portal.
        </p>
      </div>

      {/* 3 Prominent Gateway Cards */}
      <div className="space-y-3.5">
        {gateways.map((gw) => {
          const LogoComponent = gw.logo;

          return (
            <button
              key={gw.id}
              type="button"
              onClick={() => onSelect(gw.id)}
              className={`group w-full p-4 sm:p-4.5 rounded-2xl bg-black/60 border ${gw.borderColor} ${gw.hoverBorderColor} ${gw.glowShadow} flex items-center justify-between gap-3 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Brand Logo Container */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: gw.accentColor }}
                >
                  <LogoComponent className="w-7 h-7 text-white fill-current" />
                </div>

                {/* Gateway Metadata */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      {gw.name}
                    </h3>
                    <span className="text-xs text-zinc-400 font-medium">
                      ({gw.bengaliName})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${gw.badgeColor} uppercase tracking-wider`}>
                      {gw.badge}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 truncate">
                    {gw.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Chevron */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white transition-transform group-hover:translate-x-1"
                style={{ backgroundColor: `${gw.accentColor}33` }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: gw.accentColor }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <button
          type="button"
          onClick={onBackToDetails}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Information</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Safe & Verified Mobile Checkout</span>
        </div>
      </div>
    </div>
  );
}
