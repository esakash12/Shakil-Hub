"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, Sparkles, SlidersHorizontal, ArrowRight, Video } from "lucide-react";
import CourseCard, { CourseProps } from "@/components/ui/CourseCard";

interface CoursesCatalogClientProps {
  initialCourses: CourseProps[];
}

export default function CoursesCatalogClient({
  initialCourses,
}: CoursesCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = [
    "All",
    "Video Editing",
    "VFX & Motion",
    "Color Grading",
    "Audio",
  ];

  // Filter logic
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (course.category &&
          course.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description &&
          course.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, initialCourses]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen text-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-gray-400"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-cyan-400 font-medium">All Courses</span>
        </nav>

        {/* Header Title Section */}
        <div className="space-y-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Masterclass Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Explore Our Masterclasses
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal leading-relaxed">
            Gain industry-standard editing, motion graphics, and color grading skills from active creative professionals.
          </p>
        </div>

        {initialCourses.length === 0 ? (
          /* Empty Catalog State */
          <div className="p-12 sm:p-16 rounded-3xl bg-[#0e1320]/85 border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Video className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">New Masterclasses Dropping Soon!</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Our course catalog is being updated with fresh 4K lessons. Explore our instructor roster or sign up for announcements.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/instructors"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              >
                <span>Meet Instructors</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Category Filter Bar */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search courses by keyword, tool..."
                    className="w-full rounded-xl bg-[#0e1320]/90 border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 shadow-inner transition-all"
                  />
                </div>

                {/* Results Count */}
                <span className="text-xs text-gray-400 font-mono self-center sm:self-auto">
                  Showing {filteredCourses.length} courses
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] border border-cyan-400/50"
                          : "bg-[#0e1320]/75 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/30"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Grid */}
            {displayedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
                {displayedCourses.map((course, index) => (
                  <CourseCard key={`${course.id}-${index}`} course={course} index={index} />
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                <SlidersHorizontal className="w-8 h-8 text-gray-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No masterclasses found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  We couldn&apos;t find any courses matching your search criteria. Try another keyword or filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-white/5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
