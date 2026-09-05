"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Award,
  Users,
  Video,
  CheckCircle2,
} from "lucide-react";
import { getCourseBySlug, CourseDetail } from "@/lib/data/courses";

interface CourseInstructorProps {
  initialCourse?: CourseDetail;
}

export default function CourseInstructor({ initialCourse }: CourseInstructorProps = {}) {
  const params = useParams();
  const slug = (params?.slug as string) || "premiere-pro-masterclass";
  const course = initialCourse || getCourseBySlug(slug);

  const stats = [
    { label: "Years Experience", value: course.instructor.experience, icon: Award },
    { label: "Projects Completed", value: course.instructor.projects, icon: Video },
    { label: "Students Trained", value: course.instructor.students, icon: Users },
  ];

  return (
    <div id="instructor" className="space-y-3 sm:space-y-5 select-none text-white scroll-mt-28">
      {/* Main Instructor Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group rounded-2xl bg-[#0e1320]/90 border border-white/10 hover:border-cyan-500/50 p-4 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.18)] hover:-translate-y-2 backdrop-blur-xl transition-all duration-300"
      >
        {/* Instructor Avatar */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#0c1017] border border-cyan-500/30 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:border-cyan-400/50 transition-colors">
          <Image
            src={course.instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
            alt={course.instructor.name}
            fill
            priority
            sizes="(max-width: 768px) 112px, 144px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content & Bio */}
        <div className="space-y-4 text-center md:text-left flex-1">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold mb-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              Lead Instructor
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              {course.instructor.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-0.5">
              {course.instructor.role}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
            {course.instructor.bio}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 py-2">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#0a0e17]/90 border border-cyan-500/15 text-center space-y-1 hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <stat.icon className="w-4 h-4 mx-auto text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                <div className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] text-zinc-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 pt-1">
            {[
              { icon: Youtube, href: "#", label: "YouTube" },
              { icon: Facebook, href: "#", label: "Facebook" },
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/20 hover:border-cyan-400/60 hover:bg-cyan-500/20 text-zinc-200 hover:text-cyan-300 flex items-center justify-center transition-all shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:-translate-y-0.5"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
