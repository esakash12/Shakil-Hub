"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Calendar,
  Send,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  User,
  FileText,
} from "lucide-react";

export default function AgencyConsultation() {
  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: "",
    serviceType: "Video Production",
    projectBrief: "",
    preferredTime: "As soon as possible",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.whatsappNumber.trim()) return;

    setSubmitted(true);

    const messageText = `*New Free Consultation & Meeting Request - Sakil Hub*
👤 *Client Name:* ${formData.fullName.trim()}
📱 *WhatsApp:* ${formData.whatsappNumber.trim()}
🎯 *Requested Service:* ${formData.serviceType}
⏰ *Preferred Time:* ${formData.preferredTime}
📝 *Project Notes:* ${formData.projectBrief.trim() || "Ready to discuss details during meeting."}`;

    const whatsappUrl = `https://wa.me/8801326896947?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section id="contact" className="relative py-14 sm:py-24 bg-black select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Commitment Consultation</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Book a Free Meeting & Consultation
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Have an upcoming commercial, brand campaign, real estate project, or website? Let&apos;s talk vision, timeline, and exact budget.
          </p>
        </div>

        {/* 2-Column Consultation & Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Left Column: Direct WhatsApp & Value Highlights (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#0a0d16]/90 border border-white/10 flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-xl">
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Instant Access
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Direct WhatsApp Hotline
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Skip the emails. Connect directly with our creative team on WhatsApp for prompt responses within 15 minutes.
                </p>
              </div>

              {/* WhatsApp Callout Pill Box */}
              <a
                href="https://wa.me/8801326896947?text=Hello%20Sakil%20Hub!%20I%20want%20to%20schedule%20a%20Free%20Meeting%20%26%20Consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#0e171e] to-teal-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 hover:border-emerald-400 transition-all group shadow-lg cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-6 h-6 fill-black" />
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase">
                      Official Agency WhatsApp
                    </div>
                    <div className="text-base sm:text-lg font-black text-white font-mono">
                      01326896947
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-300 group-hover:translate-x-1 transition-transform">
                  Chat Now →
                </span>
              </a>

              {/* Guarantees List */}
              <div className="space-y-2.5 pt-3 border-t border-white/5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Free 30-Minute Creative Strategy Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom Pricing & Milestone Breakdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>NDA & Commercial Confidentiality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>In-Person Studio Meeting Available (Banani, Dhaka)</span>
                </div>
              </div>
            </div>

            {/* Operating Hours Note */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Available Saturday – Thursday, 10:00 AM – 9:00 PM (BST)</span>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Booking Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#0a0d16]/95 border border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Tell Us About Your Project
                </h3>
                <p className="text-xs text-zinc-400">
                  Fill out this 1-minute form and our creative directors will review your requirements immediately.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Full Name (আপনার নাম) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300">
                      WhatsApp Number (হোয়াটসঅ্যাপ নম্বর) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={formData.whatsappNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                        }
                        placeholder="01XXXXXXXXX"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Service Needed (প্রয়োজনীয় সেবা)
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, serviceType: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white text-xs sm:text-sm transition-colors outline-none cursor-pointer"
                    >
                      <option value="Video Production">🎥 Video Production (Shoot / Script / Studio)</option>
                      <option value="Ai Work">🤖 Ai Work / AI Video Commercial</option>
                      <option value="Promotional ADS">🎬 Promotional ADS / Social Media Ads</option>
                      <option value="Real Estate Video">🏢 Real Estate / Villa Tour Video</option>
                      <option value="Wedding Film">💍 Wedding Cinema / Film Highlights</option>
                      <option value="YouTube / Vlogs">📹 YouTube Vlog & Content Editing</option>
                      <option value="Graphic Design">🎨 Graphic Design & Thumbnails</option>
                      <option value="Digital Marketing">📱 Digital Marketing & Page Setup</option>
                      <option value="Website Development">💻 Website Development</option>
                      <option value="Custom Agency Project">✨ Full Agency Package / Custom Project</option>
                    </select>
                  </div>

                  {/* Preferred Meeting Time */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Preferred Meeting Time (মিটিংয়ের সময়)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.preferredTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))
                        }
                        placeholder="e.g. Today Evening, Tomorrow 4 PM"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Brief */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Project Brief / Requirements (প্রজেক্ট সম্পর্কে কিছু তথ্য)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.projectBrief}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, projectBrief: e.target.value }))
                    }
                    placeholder="Tell us about your product, desired duration, style references, or any questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none resize-none"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    <Send className="w-4 h-4 fill-black" />
                    <span>Schedule Free Consultation on WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No spam. 100% direct confidential communication with Sakil Hub.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
