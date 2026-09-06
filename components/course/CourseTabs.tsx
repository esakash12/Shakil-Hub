"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

import { CourseDetail } from "@/lib/data/courses";

interface CourseTabsProps {
  slug?: string;
  reviewsCount?: number | string;
  initialCourse?: CourseDetail;
}

export default function CourseTabs({
  slug: propSlug,
  reviewsCount,
  initialCourse,
}: CourseTabsProps = {}) {
  const pathname = usePathname();
  const params = useParams();
  const slug = propSlug || (params?.slug as string) || "";

  const revCount =
    reviewsCount !== undefined
      ? reviewsCount
      : initialCourse?.reviewsCount || "0";

  const tabs = [
    {
      name: "About Course",
      href: `/courses/${slug}`,
      exact: true,
    },
    {
      name: "Curriculum",
      href: `/courses/${slug}/curriculum`,
      exact: false,
    },
    {
      name: "Instructor",
      href: `/courses/${slug}/instructor`,
      exact: false,
    },
    {
      name: `Reviews (${revCount})`,
      href: `/courses/${slug}/reviews`,
      exact: false,
    },
  ];

  const isTabActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="sticky top-14 sm:top-16 z-20 w-full bg-[#0e1320]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 mb-4 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = isTabActive(tab.href, tab.exact);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`text-xs sm:text-sm font-bold whitespace-nowrap px-4 py-2.5 rounded-xl transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent font-medium"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
