"use client";

import React from "react";
import { motion } from "framer-motion";
import { Film, Sparkles, Sliders, Volume2 } from "lucide-react";
import { HomePillarItem, DEFAULT_HOME_CMS } from "@/lib/data/home-cms-types";

interface WhatYouWillLearnProps {
  title?: string;
  items?: HomePillarItem[];
}

const defaultIcons = [Film, Sparkles, Sliders, Volume2];

export default function WhatYouWillLearn({
  title = DEFAULT_HOME_CMS.whatYouWillLearnTitle,
  items = DEFAULT_HOME_CMS.whatYouWillLearnItems,
}: WhatYouWillLearnProps = {}) {
  const displayItems = items && items.length > 0 ? items : DEFAULT_HOME_CMS.whatYouWillLearnItems;

  return (
    <section className="py-4 sm:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Fade In */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-4 sm:mb-6 text-left"
        >
          {title}
        </motion.h2>

        {/* 2x2 App-like Grid on Mobile / 4-column on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {displayItems.map((feature, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                className="group rounded-2xl bg-[#0e1320]/80 hover:bg-[#121828] border border-white/10 hover:border-cyan-500/40 p-4 sm:p-5 md:p-6 text-center flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_30px_rgba(6,182,212,0.15)] backdrop-blur-xl cursor-pointer"
              >
                {/* Center Cyan Glow Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2 sm:mb-3.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-1 font-normal line-clamp-2 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
