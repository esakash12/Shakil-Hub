"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Play, GraduationCap } from "lucide-react";

export interface CourseProps {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewsCount: string;
}

export default function CourseCard({
  course,
  index = 0,
}: {
  course: CourseProps;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group rounded-2xl bg-[#0e1320]/90 hover:bg-[#121929] border border-white/10 hover:border-cyan-500/50 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] flex flex-col justify-between backdrop-blur-xl cursor-pointer"
    >
      <Link href={`/courses/${course.id}`} className="block">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 mb-3.5 flex items-center justify-center">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
                <Play className="w-4 h-4 fill-cyan-400 ml-0.5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight line-clamp-1">
                {course.title}
              </span>
              <span className="text-[9px] text-cyan-400/80 mt-0.5 uppercase tracking-wider font-mono">
                {course.category || "Masterclass"}
              </span>
            </div>
          )}
        </div>

        {/* Title & Category */}
        <div className="space-y-1 mb-4">
          <h3 className="text-sm sm:text-[15px] font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-xs text-zinc-300 line-clamp-1 font-medium">
            {course.category}
          </p>
        </div>
      </Link>

      {/* Pricing & Rating Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        {/* Price display */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-black text-white">
            {course.price}
          </span>
          <span className="text-[11px] text-zinc-400 line-through font-medium">
            {course.originalPrice}
          </span>
        </div>

        {/* Rating display */}
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-white text-xs">
            {course.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-zinc-300 font-medium">
            ({course.reviewsCount})
          </span>
        </div>
      </div>
    </motion.div>
  );
}
