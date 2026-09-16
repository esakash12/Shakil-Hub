"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Calendar,
  Send,
  Sparkles,
  Phone,
  Clock,
  Check,
  ShieldCheck,
  User,
  ArrowUpRight,
} from "lucide-react";

export default function AgencyConsultation() {
  const [selectedService, setSelectedService] = useState("Video Production");
  const [selectedBudget, setSelectedBudget] = useState("Standard (৳30K - ৳80K)");
  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: "",
    projectBrief: "",
    preferredTime: "As soon as possible",
  });

  const serviceOptions = [
    "Video Production",
    "AI Commercials",
    "Promotional ADS",
    "Real Estate Cinema",
    "Wedding Film",
    "Graphic Design",
    "Digital Marketing",
    "Website Development",
  ];

  const budgetOptions = [
    "Starter (< ৳30K)",
    "Standard (৳30K - ৳80K)",
    "Premium (৳80K - ৳200K)",
    "Enterprise / Retainer",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.whatsappNumber.trim()) return;

    const messageText = `*New Studio Consultation Request — Sakil Hub*
👤 *Client Name:* ${formData.fullName.trim()}
📱 *WhatsApp:* ${formData.whatsappNumber.trim()}
🎬 *Service:* ${selectedService}
💰 *Budget Tier:* ${selectedBudget}
⏰ *Preferred Meeting:* ${formData.preferredTime}
📝 *Project Notes:* ${formData.projectBrief.trim() || "Ready to discuss scope & vision directly."}`;

    const whatsappUrl = `https://wa.me/8801326896947?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="contact" className="relative py-16 sm:py-24 bg-[#030508] select-none overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/8 blur-[150px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-emerald-400 text-xs font-mono font-medium tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>04 // STUDIO COMMISSION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Book a Free Strategy Meeting
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
            Have an upcoming commercial, viral ad campaign, real estate project, or website? Let&apos;s engineer your creative roadmap and budget.
          </p>
        </div>

        {/* 2-Column Terminal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Direct Hotline Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#070a11] border border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                  Direct Line
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  WhatsApp Direct Desk
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Skip the long email chains. Connect directly with our production leads on WhatsApp for immediate feedback within 15 minutes.
                </p>
              </div>

              {/* WhatsApp Live Card */}
              <a
                href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub!%20I%20want%20to%20schedule%20a%20Free%20Meeting%20%26%20Consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/50 flex items-center justify-between gap-3 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      OFFICIAL STUDIO WHATSAPP
                    </div>
                    <div className="text-base font-mono font-bold text-white tracking-wide">
                      01326896947
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Guarantees List */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Free 30-Minute Creative Strategy Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Itemized Pricing & Milestone Breakdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Commercial Non-Disclosure (NDA) Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Private In-Person Studio Meeting (Banani, Dhaka)</span>
                </div>
              </div>
            </div>

            {/* Operating Hours Note */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-zinc-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sat – Thu, 10:00 AM – 9:00 PM BST</span>
            </div>
          </div>

          {/* Right Column: Interactive Project Inquiry Terminal (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#070a11] border border-white/[0.08] p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* 1. Select Service Pills */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  1. Select Service Category:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {serviceOptions.map((srv) => {
                    const isSelected = selectedService === srv;
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                            : "bg-white/[0.02] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {srv}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Select Budget Tier */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  2. Anticipated Budget Tier:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {budgetOptions.map((bgt) => {
                    const isSelected = selectedBudget === bgt;
                    return (
                      <button
                        key={bgt}
                        type="button"
                        onClick={() => setSelectedBudget(bgt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                            : "bg-white/[0.02] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {bgt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Client Identity Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase text-zinc-400">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] hover:border-white/20 focus:border-cyan-400 text-white placeholder-zinc-500 text-xs transition-colors outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-mono uppercase text-zinc-400">
                    WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                      }
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] hover:border-white/20 focus:border-emerald-400 text-white placeholder-zinc-500 text-xs transition-colors outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Project Notes */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase text-zinc-400">
                  Brief Project Notes / Objectives
                </label>
                <textarea
                  rows={2}
                  value={formData.projectBrief}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, projectBrief: e.target.value }))
                  }
                  placeholder="Tell us about the deliverable, desired timeline, or reference videos..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/[0.08] hover:border-white/20 focus:border-cyan-400 text-white placeholder-zinc-500 text-xs transition-colors outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 fill-black" />
                  <span>Send Project Brief to WhatsApp (01326896947)</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10.5px] font-mono text-zinc-500">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Confidential. 100% direct connection with Mehedi Hasan Sakil.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

