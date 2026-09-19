"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Film,
  Video,
  Flame,
  Tv,
} from "lucide-react";

interface ProjectTypeOption {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  basePriceBdt: number;
  basePriceUsd: number;
  deliveryDays: number;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    id: "commercial",
    name: "Cinematic Brand Commercial",
    desc: "Hollywood-grade color grading, sound design & cinematic pacing.",
    icon: Film,
    basePriceBdt: 15000,
    basePriceUsd: 150,
    deliveryDays: 4,
  },
  {
    id: "youtube",
    name: "YouTube Retention Edit",
    desc: "Fast visual hooks, dynamic pacing, motion graphics & SFX.",
    icon: Tv,
    basePriceBdt: 8000,
    basePriceUsd: 80,
    deliveryDays: 3,
  },
  {
    id: "ai_video",
    name: "AI-Powered Commercial & VFX",
    desc: "Runway Gen-3, Midjourney visual synthesis & futuristic CGI.",
    icon: Sparkles,
    basePriceBdt: 20000,
    basePriceUsd: 200,
    deliveryDays: 5,
  },
  {
    id: "short_form",
    name: "Short-Form Viral Reels/TikTok",
    desc: "Animated subtitles, sound design, sound fx & viral hooks.",
    icon: Flame,
    basePriceBdt: 4500,
    basePriceUsd: 45,
    deliveryDays: 2,
  },
];

interface LengthOption {
  id: string;
  label: string;
  multiplier: number;
}

const LENGTH_OPTIONS: LengthOption[] = [
  { id: "short", label: "Under 60s (Short/Reel)", multiplier: 1.0 },
  { id: "medium", label: "1 to 3 Minutes", multiplier: 1.5 },
  { id: "long", label: "3 to 10 Minutes", multiplier: 2.2 },
  { id: "bundle", label: "Monthly Pack (4 Videos)", multiplier: 3.4 },
];

interface AddonOption {
  id: string;
  name: string;
  priceBdt: number;
  priceUsd: number;
  rush?: boolean;
}

const ADDONS: AddonOption[] = [
  {
    id: "sound_design",
    name: "Cinematic Sound Design & Mix",
    priceBdt: 2000,
    priceUsd: 20,
  },
  {
    id: "script_ai",
    name: "Scriptwriting & AI Voiceover",
    priceBdt: 2500,
    priceUsd: 25,
  },
  {
    id: "thumbnail",
    name: "CTR Optimized 4K Thumbnail",
    priceBdt: 1200,
    priceUsd: 12,
  },
  {
    id: "rush",
    name: "48-Hour Priority Express Delivery",
    priceBdt: 4000,
    priceUsd: 40,
    rush: true,
  },
];

export default function ProjectCostEstimator() {
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [selectedType, setSelectedType] = useState<string>("commercial");
  const [selectedLength, setSelectedLength] = useState<string>("medium");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "sound_design",
  ]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const project = PROJECT_TYPES.find((p) => p.id === selectedType)!;
    const length = LENGTH_OPTIONS.find((l) => l.id === selectedLength)!;

    const baseAmount =
      currency === "BDT" ? project.basePriceBdt : project.basePriceUsd;

    let total = baseAmount * length.multiplier;

    selectedAddons.forEach((addonId) => {
      const addon = ADDONS.find((a) => a.id === addonId);
      if (addon) {
        total += currency === "BDT" ? addon.priceBdt : addon.priceUsd;
      }
    });

    const isRush = selectedAddons.includes("rush");
    const deliveryTime = isRush
      ? "24–48 Hours"
      : `${project.deliveryDays}–${project.deliveryDays + 2} Business Days`;

    // Round nicely
    const minEst = Math.round(total * 0.95);
    const maxEst = Math.round(total * 1.1);

    return {
      project,
      length,
      minEst,
      maxEst,
      deliveryTime,
      isRush,
    };
  }, [currency, selectedType, selectedLength, selectedAddons]);

  const handleSendToWhatsApp = () => {
    const addonNames = selectedAddons
      .map((id) => ADDONS.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const formattedCurrency = currency === "BDT" ? "৳" : "$";
    const estimateStr = `${formattedCurrency}${calculation.minEst.toLocaleString()} - ${formattedCurrency}${calculation.maxEst.toLocaleString()} ${currency}`;

    const message = `Hello MH Sakil! I configured a project estimate on Sakil Hub:
• Project: ${calculation.project.name}
• Length: ${calculation.length.label}
• Add-ons: ${addonNames || "None"}
• Estimated Budget: ${estimateStr}
• Timeline: ${calculation.deliveryTime}

I would like to discuss and get started with this project!`;

    const url = `https://wa.me/8801326896947?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <section
      id="calculator"
      className="relative py-16 sm:py-20 bg-[#02050e] select-none overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-[#00d2ff]/6 blur-[150px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-medium tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>✦ INSTANT PROJECT ESTIMATOR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Estimate Your Creative Project
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            Select your project specifications below to get an instant realistic
            budget estimate and timeline before booking.
          </p>

          {/* Currency Toggle */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setCurrency("BDT")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  currency === "BDT"
                    ? "bg-[#00d2ff] text-black shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                BDT (৳)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-[#00d2ff] text-black shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Selectors */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Project Type */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#00d2ff] text-black text-[10px] flex items-center justify-center font-extrabold">
                  1
                </span>
                <span>Select Project Type</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROJECT_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = selectedType === pt.id;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => setSelectedType(pt.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-cyan-950/40 border-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.15)]"
                          : "bg-[#070b16] border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#00d2ff] text-black"
                              : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white leading-tight">
                          {pt.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">
                        {pt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Duration / Volume */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#00d2ff] text-black text-[10px] flex items-center justify-center font-extrabold">
                  2
                </span>
                <span>Video Length / Volume</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LENGTH_OPTIONS.map((opt) => {
                  const isSelected = selectedLength === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedLength(opt.id)}
                      className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#00d2ff] text-black font-extrabold border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                          : "bg-[#070b16] text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/20"
                      }`}
                    >
                      <span className="text-[11px] block leading-tight font-mono">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Production Add-ons */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#00d2ff] text-black text-[10px] flex items-center justify-center font-extrabold">
                  3
                </span>
                <span>Production Add-ons</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  const formattedAddonPrice =
                    currency === "BDT"
                      ? `+৳${addon.priceBdt.toLocaleString()}`
                      : `+$${addon.priceUsd}`;

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? "bg-cyan-950/30 border-[#00d2ff]/60"
                          : "bg-[#070b16] border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-[#00d2ff] border-[#00d2ff] text-black"
                              : "border-white/20 bg-black/40"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium text-white leading-tight">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 shrink-0 font-bold">
                        {formattedAddonPrice}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Summary & WhatsApp CTA */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-2xl bg-[#070b16] border border-[#00d2ff]/25 p-6 sm:p-7 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,210,255,0.12)]">
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                  Live Project Breakdown
                </div>
                <h3 className="text-lg font-bold text-white">
                  {calculation.project.name}
                </h3>
              </div>

              {/* Specs List */}
              <div className="space-y-2 py-3 border-y border-white/[0.08] text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Duration:</span>
                  <span className="text-white font-bold">
                    {calculation.length.label}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Add-ons:</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedAddons.length} Selected
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 items-center">
                  <span>Timeline:</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>{calculation.deliveryTime}</span>
                  </span>
                </div>
              </div>

              {/* Price Range Box */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-[#00d2ff]/30 text-center space-y-1">
                <div className="text-[11px] font-mono text-zinc-400">
                  Estimated Project Investment
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white text-[#00d2ff] tracking-tight">
                  {currency === "BDT" ? "৳" : "$"}
                  {calculation.minEst.toLocaleString()} –{" "}
                  {currency === "BDT" ? "৳" : "$"}
                  {calculation.maxEst.toLocaleString()}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Exact quotation finalized upon review of raw footage & scope.
                </p>
              </div>

              {/* Send to WhatsApp Button */}
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full py-3.5 px-6 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Book This Project on WhatsApp</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
