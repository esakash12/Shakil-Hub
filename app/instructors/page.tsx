import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Users,
  Video,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  BookOpen,
} from "lucide-react";

import { getStorefrontInstructorsAction } from "@/lib/actions/instructors";

export const metadata: Metadata = {
  title: "Instructors | Sakil Hub",
  description:
    "Learn from industry-leading video editors, motion designers, and colorists at Sakil Hub.",
};

export default async function InstructorsPage() {
  const res = await getStorefrontInstructorsAction();
  const displayInstructors = res.success && res.instructors ? res.instructors : [];

  return (
    <div className="min-h-screen bg-black text-white py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>World-Class Mentors</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Learn From Active <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Industry Professionals
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
            Our instructors don&apos;t just teach theory. They actively edit commercial campaigns, YouTube creator videos, and feature films every single day.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {displayInstructors.map((instructor) => {
            const initials = instructor.name
              ? instructor.name
                  .split(" ")
                  .filter(Boolean)
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "IN";

            return (
              <div
                key={instructor.id}
                className="group rounded-2xl bg-[#0e1320]/90 border border-white/10 hover:border-cyan-500/50 p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.18)] backdrop-blur-xl"
              >
                <div className="space-y-5">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4">
                    {instructor.avatar ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/50 border border-cyan-500/30 shrink-0 shadow-lg group-hover:border-cyan-400/60 transition-colors">
                        <Image
                          src={instructor.avatar}
                          alt={instructor.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-950 via-[#0c1017] to-neutral-900 border border-cyan-500/30 shrink-0 shadow-lg flex flex-col items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 transition-colors">
                        <span className="text-lg sm:text-xl font-black tracking-wider">
                          {initials}
                        </span>
                        <span className="text-[8px] font-mono text-cyan-400/70 uppercase tracking-wider">
                          Mentor
                        </span>
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Instructor</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                        {instructor.name}
                      </h3>
                      <p className="text-xs text-zinc-300 font-medium truncate">
                        {instructor.role}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed font-normal">
                    {instructor.bio}
                  </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#0a0e17]/90 border border-cyan-500/15 text-center">
                    <p className="text-sm font-extrabold text-white">
                      {instructor.experience}
                    </p>
                    <p className="text-[10px] text-zinc-300 font-medium">Experience</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0a0e17]/90 border border-cyan-500/15 text-center">
                    <p className="text-sm font-extrabold text-white">
                      {instructor.students}
                    </p>
                    <p className="text-[10px] text-zinc-300 font-medium">Students</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0a0e17]/90 border border-cyan-500/15 text-center">
                    <p className="text-sm font-extrabold text-white">
                      {instructor.projects}
                    </p>
                    <p className="text-[10px] text-zinc-300 font-medium">Projects</p>
                  </div>
                </div>

                {/* Courses Taught Section */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Courses by {instructor.name.split(" ")[0]}</span>
                  </h4>
                  <div className="space-y-2">
                    {instructor.courses && instructor.courses.length > 0 ? (
                      instructor.courses.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/courses/${c.slug}`}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.06] flex items-center justify-between gap-3 text-xs transition-colors group/course"
                        >
                          <span className="font-medium text-white group-hover/course:text-cyan-300 transition-colors line-clamp-1">
                            {c.title}
                          </span>
                          <span className="font-mono text-cyan-400 font-bold shrink-0">
                            {c.price}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center text-[11px] text-gray-500 italic">
                        New masterclasses in production
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-semibold">Connect:</span>
                <div className="flex items-center gap-2">
                  {[
                    { icon: Youtube, href: instructor.socials?.youtube, label: "YouTube" },
                    { icon: Instagram, href: instructor.socials?.instagram, label: "Instagram" },
                    { icon: Facebook, href: instructor.socials?.facebook, label: "Facebook" },
                    { icon: Linkedin, href: instructor.socials?.linkedin, label: "LinkedIn" },
                  ]
                    .filter((s) => s.href)
                    .map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/20 hover:bg-cyan-500/20 hover:border-cyan-400/60 text-zinc-200 hover:text-cyan-300 flex items-center justify-center transition-all shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:-translate-y-0.5"
                      >
                        <social.icon className="w-3.5 h-3.5" />
                      </a>
                    ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 p-8 sm:p-12 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready to learn from the best in the industry?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
              Get lifetime access to 90+ hours of step-by-step masterclasses, downloadable project files, and personal mentorship.
            </p>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <span>Explore All Masterclasses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
