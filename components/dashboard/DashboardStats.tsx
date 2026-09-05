"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, CheckCircle2, Clock, Award } from "lucide-react";

export default function DashboardStats({
  enrolledCount = 0,
  completedLessons = 0,
  hoursWatched = "0",
  certificatesCount = 0,
}: {
  enrolledCount?: number;
  completedLessons?: number;
  hoursWatched?: string | number;
  certificatesCount?: number;
}) {
  const stats = [
    {
      id: "enrolled",
      label: "Enrolled Courses",
      value: enrolledCount.toString(),
      icon: Layers,
      color: "text-blue-400",
      bg: "bg-blue-600/15 border-blue-500/20",
    },
    {
      id: "completed",
      label: "Completed Lessons",
      value: completedLessons.toString(),
      icon: CheckCircle2,
      color: "text-cyan-400",
      bg: "bg-cyan-600/15 border-cyan-500/20",
    },
    {
      id: "hours",
      label: "Hours Watched",
      value: typeof hoursWatched === "number" ? hoursWatched.toFixed(1) : hoursWatched.toString(),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-600/15 border-amber-500/20",
    },
    {
      id: "certificates",
      label: "Certificates",
      value: certificatesCount.toString(),
      icon: Award,
      color: "text-indigo-400",
      bg: "bg-indigo-600/15 border-indigo-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5 hover:border-white/10 transition-colors"
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${stat.bg} border flex items-center justify-center shrink-0 shadow-inner`}
            >
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 font-normal">
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
