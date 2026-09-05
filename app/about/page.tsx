import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  Award,
  Users,
  Film,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { getAboutCmsAction } from "@/lib/actions/about";

export const metadata: Metadata = {
  title: "About Us | Sakil Hub",
  description: "Learn about Sakil Hub's mission to empower creative video editors and motion designers.",
};

export default async function AboutPage() {
  const about = await getAboutCmsAction();

  const milestoneIcons = [Users, Film, Award, Globe2];

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-400"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-blue-400 font-medium">About Sakil Hub</span>
        </nav>

        {/* Hero / Mission Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{about.missionBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {about.heroHeadline}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
              {about.heroParagraph1}
            </p>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
              {about.heroParagraph2}
            </p>

            <div className="pt-2">
              <Link
                href={about.heroCtaHref || "/courses"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all"
              >
                <span>{about.heroCtaText || "Explore Masterclasses"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Cinematic Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-white/[0.03] p-1.5 border border-white/10 shadow-2xl overflow-hidden">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
                <Image
                  src={about.heroImageUrl || "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80"}
                  alt="Sakil Hub Studio Editing"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-gray-300">
                    {about.heroImageBadge || "Industry Standard Curriculum Tested on 500+ Client Projects"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {about.milestones.map((m, i) => {
            const Icon = milestoneIcons[i % milestoneIcons.length] || Users;
            return (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-[#0e1320]/80 border border-white/10 flex items-center gap-4 hover:border-cyan-500/30 transition-colors shadow-lg"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {m.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-normal">
                    {m.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Values Section */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center md:text-left">
            {about.whyTitle || "Why Students Choose Sakil Hub"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {about.values.map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0e1320]/80 border border-white/10 hover:border-cyan-500/30 space-y-3 transition-colors shadow-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-mono font-bold text-xs">
                  {v.step || `0${i + 1}`}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Instructor Highlight Card */}
        <div className="rounded-2xl bg-[#0e1320]/80 border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-xl">
          {about.leadInstructorAvatar ? (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-black border border-cyan-500/30 shrink-0">
              <Image
                src={about.leadInstructorAvatar}
                alt={about.leadInstructorName || "Lead Instructor"}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-cyan-950 via-[#0c1017] to-neutral-900 border border-cyan-500/30 shrink-0 flex flex-col items-center justify-center text-cyan-400 shadow-md">
              <span className="text-xl sm:text-2xl font-black tracking-wider">
                {about.leadInstructorName
                  ? about.leadInstructorName
                      .split(" ")
                      .filter(Boolean)
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "SA"}
              </span>
              <span className="text-[9px] font-mono text-cyan-400/70 mt-0.5 uppercase tracking-widest">
                Instructor
              </span>
            </div>
          )}

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>{about.leadInstructorBadge || "Founder & Master Instructor"}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {about.leadInstructorName}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-normal max-w-2xl">
              &quot;{about.leadInstructorQuote}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
