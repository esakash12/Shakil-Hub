"use client";

import React, { useState, useEffect } from "react";

interface CourseAnchorNavProps {
  reviewsCount?: number | string;
}

export default function CourseAnchorNav({ reviewsCount = 0 }: CourseAnchorNavProps) {
  const [activeSection, setActiveSection] = useState("about");

  const navItems = [
    { id: "about", label: "About Course" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: `Reviews (${reviewsCount})` },
    { id: "faq", label: "FAQ" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <nav aria-label="Course Sections" className="w-full bg-[#0e1320]/85 border border-white/10 rounded-2xl p-1.5 my-6 select-none shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className={`text-xs sm:text-sm font-bold whitespace-nowrap px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent font-medium"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}