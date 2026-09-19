"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";

import { AgencyCmsData } from "@/lib/data/agency-cms-types";

export default function AgencyConsultation({ cmsData }: { cmsData?: AgencyCmsData }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("11:00 AM");

  const timeSlots = ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

  const badge = cmsData?.consultationBadge || "LET’S WORK TOGETHER";
  const title = cmsData?.consultationTitle || "Let’s Build Something Great Together.";
  const subtitle =
    cmsData?.consultationSubtitle ||
    "Have a project in mind?\nSchedule a 30-minute strategy session with MH Sakil, Founder & CEO of Sakil Hub. Let’s discuss your goals, explore creative solutions, and build a clear roadmap for your project.";
  const check1 = cmsData?.consultationCheck1 || "Free Consultation";
  const check2 = cmsData?.consultationCheck2 || "Project Planning";
  const check3 = cmsData?.consultationCheck3 || "Custom Quote";
  const btnText = cmsData?.consultationBtnText || "Book a Strategy Meeting";

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = cmsData?.consultationWhatsapp || "01326896947";
    const cleanNum = rawNum.replace(/\D/g, "");
    const phoneWithCountry = cleanNum.startsWith("880")
      ? cleanNum
      : cleanNum.startsWith("0")
      ? `88${cleanNum}`
      : `880${cleanNum}`;

    let formattedDate = selectedDate;
    if (selectedDate && selectedDate.includes("-")) {
      try {
        const [y, m, d] = selectedDate.split("-").map(Number);
        if (y && m && d) {
          const dateObj = new Date(y, m - 1, d);
          formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      } catch {
        formattedDate = selectedDate;
      }
    }

    const message = `Hello MH Sakil! I would like to book a Strategy Meeting on ${formattedDate} at ${selectedTime}.`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <section id="contact" className="relative py-12 sm:py-16 bg-[#02050e] select-none overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00d2ff]/6 blur-[160px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Copy & Guarantees */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-mono font-medium tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>✦ {badge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-md leading-relaxed font-normal whitespace-pre-line">
              {subtitle}
            </p>

            {/* Checklist items with 3D Calendar Graphic Tile */}
            <div className="flex items-center gap-6 pt-2">
              {/* 3D Perspective Calendar Graphic Tile */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#07132c] to-[#040916] border border-[#00d2ff]/30 flex flex-col items-center justify-center text-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.25)] shrink-0">
                <Calendar className="w-7 h-7" />
              </div>

              {/* Guarantees List */}
              <div className="space-y-2 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00d2ff] shrink-0 stroke-[2.5]" />
                  <span>{check1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00d2ff] shrink-0 stroke-[2.5]" />
                  <span>{check2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00d2ff] shrink-0 stroke-[2.5]" />
                  <span>{check3}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Booking Card (From Mockup) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[#070b16] border border-white/[0.08] p-6 sm:p-7 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.1)]">
              <form onSubmit={handleBookMeeting} className="space-y-5">
                {/* 1. Choose a Date */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-zinc-300 font-bold">
                    Choose a Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] hover:border-white/20 focus:border-[#00d2ff] text-white text-xs font-mono transition-colors outline-none cursor-pointer [color-scheme:dark]"
                    />
                    <Calendar className="w-4 h-4 text-[#00d2ff] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Choose a Time Slots */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-zinc-300 font-bold">
                    Choose a Time
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-1 rounded-xl text-xs font-mono font-medium text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#00d2ff] text-black font-extrabold shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                              : "bg-black/50 text-zinc-400 border border-white/[0.08] hover:text-white hover:border-white/20"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Book a Meeting Solid Vibrant Cyan Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>{btnText}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

