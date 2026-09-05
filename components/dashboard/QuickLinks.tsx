"use client";

import React from "react";
import Link from "next/link";
import { Compass, Download, ArrowRight } from "lucide-react";

export default function QuickLinks() {
  const links = [
    {
      title: "Browse Courses",
      description: "Explore all available video editing masterclasses",
      href: "/#courses",
      icon: Compass,
      color: "text-blue-400",
      bg: "bg-blue-600/15 border-blue-500/20",
    },
    {
      title: "Download Resources",
      description: "Access LUT packs, presets & practice footage",
      href: "#resources",
      icon: Download,
      color: "text-cyan-400",
      bg: "bg-cyan-600/15 border-cyan-500/20",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 space-y-3">
      <h3 className="text-sm font-bold text-white mb-1">Quick Links</h3>

      <div className="space-y-2.5">
        {links.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg ${item.bg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1 font-normal">
                    {item.description}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
