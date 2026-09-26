"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Lock,
  Info,
  CheckCircle2,
  ClipboardPaste,
} from "lucide-react";

export type PaymentGatewayType = "bkash" | "nagad" | "rocket";

interface ThemedPaymentGatewayProps {
  method: PaymentGatewayType;
  merchantNumber: string;
  payableAmount: string;
  orderReference: string;
  senderNumber: string;
  trxId: string;
  onSenderNumberChange: (val: string) => void;
  onTrxIdChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isProcessing: boolean;
}

/* ========================================================================= */
/* === AUTHENTIC BRAND LOGOS                                            === */
/* ========================================================================= */

export function BkashLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="24"
      height="24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M47 8 L79 38 L54 44 L47 8 Z" />
      <path d="M52 47 L86 42 L65 72 L52 47 Z" />
      <path d="M48 51 L61 77 L34 85 L48 51 Z" />
      <path d="M44 47 L30 80 L16 56 L44 47 Z" />
      <path d="M47 43 L17 52 L36 26 L47 43 Z" />
    </svg>
  );
}

export function NagadLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="24"
      height="24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9" />
      <path d="M50 16 C68 28 74 48 64 66 C56 80 38 84 26 72 C18 64 18 50 28 40 C36 32 46 32 52 38" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function RocketLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="24"
      height="24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M50 8 C62 25 72 45 70 70 L50 63 L30 70 C28 45 38 25 50 8 Z" />
      <path d="M26 68 L14 84 L32 77 Z" />
      <path d="M74 68 L86 84 L68 77 Z" />
      <circle cx="50" cy="40" r="8" fill="white" />
    </svg>
  );
}

/* ========================================================================= */
/* === MAIN THEMED PAYMENT GATEWAY COMPONENT                             === */
/* ========================================================================= */

export default function ThemedPaymentGateway({
  method,
  merchantNumber,
  payableAmount,
  orderReference,
  senderNumber,
  trxId,
  onSenderNumberChange,
  onTrxIdChange,
  onSubmit,
  onBack,
  isProcessing,
}: ThemedPaymentGatewayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePasteTrxId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onTrxIdChange(text.trim().toUpperCase());
      }
    } catch {
      // Permission blocked or not supported on this browser
    }
  };

  /* Provider Theme Configurations */
  const config = {
    bkash: {
      brandName: "bKash",
      banglaName: "বিকাশ পেমেন্ট",
      ussdCode: "*247#",
      logo: BkashLogo,
      themeHex: "#E2136E",
      themeBg: "bg-[#E2136E]",
      themeText: "text-[#E2136E]",
      themeBorder: "border-[#E2136E]",
      themeBorderLight: "border-[#E2136E]/30",
      themeSoftBg: "bg-[#E2136E]/10",
      badgeText: "bKash Send Money",
      instructionColor: "text-[#E2136E]",
      sampleTrxId: "e.g. 9J4K2L8M1",
      buttonLabel: "Verify Payment",
      cardBannerBg: "from-[#E2136E] to-[#B00E53]",
    },
    nagad: {
      brandName: "Nagad",
      banglaName: "নগদ পেমেন্ট",
      ussdCode: "*167#",
      logo: NagadLogo,
      themeHex: "#F37021",
      themeBg: "bg-[#F37021]",
      themeText: "text-[#F37021]",
      themeBorder: "border-[#F37021]",
      themeBorderLight: "border-[#F37021]/30",
      themeSoftBg: "bg-[#F37021]/10",
      badgeText: "Nagad Send Money",
      instructionColor: "text-[#F37021]",
      sampleTrxId: "e.g. 7GA19L3M",
      buttonLabel: "Verify Payment",
      cardBannerBg: "from-[#F37021] to-[#D8570C]",
    },
    rocket: {
      brandName: "Rocket",
      banglaName: "রকেট পেমেন্ট",
      ussdCode: "*322#",
      logo: RocketLogo,
      themeHex: "#8C1595",
      themeBg: "bg-[#8C1595]",
      themeText: "text-[#8C1595]",
      themeBorder: "border-[#8C1595]",
      themeBorderLight: "border-[#8C1595]/30",
      themeSoftBg: "bg-[#8C1595]/10",
      badgeText: "Rocket Send Money",
      instructionColor: "text-[#8C1595]",
      sampleTrxId: "e.g. RK9810423",
      buttonLabel: "Verify Payment",
      cardBannerBg: "from-[#8C1595] to-[#6A0D75]",
    },
  }[method];

  const LogoIcon = config.logo;

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-white/15 bg-[#0e1320] shadow-[0_20px_60px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-300">
      {/* ===================================================================== */}
      {/* 1. AUTHENTIC THEMED HEADER BAR                                       === */}
      {/* ===================================================================== */}
      <div className={`p-4 sm:p-5 bg-gradient-to-r ${config.cardBannerBg} text-white flex items-center justify-between shadow-md`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            aria-label="Change Payment Method"
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-black p-1.5 flex items-center justify-center shadow-inner">
              <span className={config.themeText}>
                <LogoIcon className="w-6 h-6 fill-current" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none">
                  {config.brandName}
                </span>
                <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {config.badgeText}
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-normal leading-tight mt-0.5">
                {config.banglaName}
              </p>
            </div>
          </div>
        </div>

        {/* Total Amount Pill */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">
            Payable Amount
          </span>
          <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-white drop-shadow-sm">
            {payableAmount}
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. MERCHANT NUMBER & REFERENCE CARD                                  === */}
      {/* ===================================================================== */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="rounded-2xl bg-black/50 border border-white/10 p-4 sm:p-4.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
                <Smartphone className={`w-3.5 h-3.5 shrink-0 ${config.themeText}`} />
                <span>{config.brandName} Personal / Send Money Number</span>
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider mt-0.5 select-all">
                {merchantNumber}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                copied
                  ? "bg-emerald-500 text-black border border-emerald-400 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105"
                  : `${config.themeSoftBg} ${config.themeText} border ${config.themeBorderLight} hover:brightness-125 hover:scale-[1.02]`
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 shrink-0 text-black stroke-[3]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>1-Tap Copy Number</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-1.5">
            <span>
              Invoice Reference: <strong className="text-white font-mono">{orderReference}</strong>
            </span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-400" />
              <span>Instant Verification</span>
            </span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. STEP-BY-STEP DIAL / APP INSTRUCTIONS                               === */}
        {/* ===================================================================== */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 sm:p-4.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Info className={`w-3.5 h-3.5 shrink-0 ${config.themeText}`} />
              <span>How to Complete Payment (কীভাবে পেমেন্ট করবেন):</span>
            </h4>
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
              Dial {config.ussdCode} or App
            </span>
          </div>

          <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
            <li>
              Open your <strong className="text-white">{config.brandName} App</strong> or dial{" "}
              <strong className="text-white font-mono">{config.ussdCode}</strong>.
            </li>
            <li>
              Select <strong className="text-white">Send Money</strong> option.
            </li>
            <li>
              Enter Receiver Number:{" "}
              <strong className={`font-mono font-bold ${config.themeText}`}>{merchantNumber}</strong>
            </li>
            <li>
              Enter Amount:{" "}
              <strong className="text-white font-mono font-bold">{payableAmount}</strong>
            </li>
            <li>
              Enter Reference:{" "}
              <strong className="text-white font-mono font-bold">{orderReference}</strong>
            </li>
            <li>Enter your Mobile Banking PIN to confirm the transaction.</li>
            <li>
              Copy the <strong className="text-white font-bold">Transaction ID (TrxID)</strong> from the confirmation SMS/App and paste below.
            </li>
          </ol>
        </div>

        {/* ===================================================================== */}
        {/* 4. TRANSACTION SUBMISSION FORM                                        === */}
        {/* ===================================================================== */}
        <form onSubmit={onSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Sender Number Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Your {config.brandName} Number *
              </label>
              <input
                type="tel"
                required
                value={senderNumber}
                onChange={(e) => onSenderNumberChange(e.target.value)}
                placeholder="01XXXXXXXXX"
                pattern="^01[3-9][0-9]{8,9}$"
                maxLength={12}
                disabled={isProcessing}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono text-base sm:text-sm"
              />
              <span className="text-[10px] text-zinc-500 block">
                The mobile number you sent money from
              </span>
            </div>

            {/* TrxID Input with Inline Paste Button */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300">
                  Transaction ID (TrxID) *
                </label>
                <button
                  type="button"
                  onClick={handlePasteTrxId}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ClipboardPaste className="w-3 h-3 shrink-0" />
                  <span>Paste</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => onTrxIdChange(e.target.value.toUpperCase())}
                  placeholder={config.sampleTrxId}
                  minLength={4}
                  maxLength={25}
                  disabled={isProcessing}
                  className="w-full pl-3.5 pr-16 py-2.5 rounded-xl bg-black/70 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono uppercase font-bold text-base sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handlePasteTrxId}
                  title="Paste TrxID from clipboard"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold text-zinc-200 hover:text-white transition-all cursor-pointer border border-white/5 active:scale-95"
                >
                  Paste
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Found in the confirmation SMS / receipt
              </span>
            </div>
          </div>

          {/* Prominent Themed Action Button */}
          <button
            type="submit"
            disabled={isProcessing}
            style={{ backgroundColor: config.themeHex }}
            className="w-full py-3.5 px-6 rounded-xl text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-white" />
                <span>Verifying Transaction ID...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white stroke-[2.5]" />
                <span>{config.buttonLabel}</span>
              </>
            )}
          </button>

          {/* Change Method & Security Footer */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
            <button
              type="button"
              onClick={onBack}
              disabled={isProcessing}
              className="text-zinc-400 hover:text-white underline font-medium cursor-pointer transition-colors"
            >
              Choose another payment method
            </button>

            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Lock className="w-3 h-3 shrink-0" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
