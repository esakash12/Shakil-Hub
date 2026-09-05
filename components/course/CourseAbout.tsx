"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, CircleCheck, AlertCircle } from "lucide-react";
import { getCourseBySlug, CourseDetail } from "@/lib/data/courses";

interface CourseAboutProps {
  initialCourse?: CourseDetail;
}

export default function CourseAbout({ initialCourse }: CourseAboutProps = {}) {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const course = initialCourse || (slug ? getCourseBySlug(slug) : null);

  if (!course) return null;

  const hasLearnings = Boolean(course.whatYouWillLearn && course.whatYouWillLearn.length > 0);
  const hasRequirements = Boolean(course.requirements && course.requirements.length > 0);
  const hasIncludes = Boolean(course.includes && course.includes.length > 0);

  return (
    <div id="about" className="space-y-3.5 sm:space-y-6 select-none scroll-mt-28">
      {/* Description */}
      <div className="rounded-2xl bg-[#0e1320]/85 border border-white/10 hover:border-cyan-500/30 p-4 sm:p-7 space-y-2.5 sm:space-y-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
        <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
          About This Masterclass
        </h2>
        <div className="text-xs sm:text-sm text-gray-300 space-y-2 sm:space-y-3 leading-relaxed font-normal">
          <p>{course.description || "Comprehensive video editing masterclass on Sakil Hub."}</p>
        </div>
      </div>

      {/* What you'll learn checklist (Only if provided) */}
      {hasLearnings && (
        <div className="rounded-2xl bg-[#0e1320]/85 border border-white/10 hover:border-cyan-500/30 p-4 sm:p-7 space-y-3 sm:space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
          <h3 className="text-sm sm:text-base font-bold text-white">
            What You Will Master:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {course.whatYouWillLearn.map((item, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-300 leading-normal">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements (Only if provided) */}
      {hasRequirements && (
        <div className="rounded-2xl bg-[#0e1320]/85 border border-white/10 hover:border-cyan-500/30 p-5 sm:p-7 space-y-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Course Requirements:
          </h3>
          <ul className="space-y-2.5">
            {course.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)] mt-2 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Includes / Extras (Only if provided) */}
      {hasIncludes && (
        <div className="rounded-2xl bg-[#0e1320]/85 border border-white/10 hover:border-cyan-500/30 p-5 sm:p-7 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
          <h3 className="text-sm sm:text-base font-bold text-white">
            Syllabus Extras & Inclusions:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {course.includes.map((item, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <CircleCheck className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center gap-2.5 text-xs text-gray-400">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Lifetime Access & Ongoing Content Updates</span>
          </div>
        </div>
      )}
    </div>
  );
}
