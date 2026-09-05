"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CourseCard, { CourseProps } from "@/components/ui/CourseCard";

export default function PopularCoursesList({
  courses,
}: {
  courses: CourseProps[];
}) {
  return (
    <section id="courses" className="py-4 sm:py-8 lg:py-10 bg-black animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Fade In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between mb-4 sm:mb-6"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
            Popular Courses
          </h2>

          <Link
            href="/courses"
            className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-transparent text-[11px] sm:text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            View All Courses
          </Link>
        </motion.div>

        {/* 3-Column Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {courses.map((course, index) => (
            <CourseCard
              key={`${course.id}-${index}`}
              course={course}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
