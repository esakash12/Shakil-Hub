"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Do I need any prior video editing experience before taking this course?",
    answer:
      "No prior experience is required. This masterclass is designed from the ground up for beginners as well as intermediate creators. Everything is taught step-by-step from software setup to advanced cinematic editing.",
  },
  {
    question: "How long do I have access to the course content?",
    answer:
      "You receive full lifetime access to all lessons, project files, and resources. You can learn at your own pace and revisit any lesson anytime in the future, including all future updates.",
  },
  {
    question: "Where do I get support if I face technical issues or have questions?",
    answer:
      "You have direct access to our student community and Q&A desk located directly beneath each lesson where the instructor and teaching assistants provide prompt answers and feedback.",
  },
  {
    question: "Will I receive an official certificate upon completing the masterclass?",
    answer:
      "Yes. Once you complete all video modules and exercises, an official, verifiable digital Certificate of Completion is automatically generated in your student dashboard.",
  },
  {
    question: "Are project files, LUTs, and sound effects included with the course?",
    answer:
      "Yes. Every practical module includes downloadable project files, cinematic LUTs, sound effects (SFX), and preset packs so you can follow along directly.",
  },
];

export default function CourseFAQ({ faqs }: { faqs?: FAQItem[] }) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const items = faqs && faqs.length > 0 ? faqs : defaultFAQs;

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faq" className="space-y-3 sm:space-y-4 select-none pt-0 scroll-mt-28">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400">
            Everything you need to know about this masterclass and student enrollment.
          </p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-2.5">
        {items.map((faq, index) => {
          const isOpen = openIndices.includes(index);

          return (
            <div
              key={index}
              className="rounded-xl sm:rounded-2xl bg-[#0e1320]/85 border border-white/10 overflow-hidden transition-all hover:border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => toggleIndex(index)}
                className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3 font-normal">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}