"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ThumbsUp, CheckCircle, MessageSquare } from "lucide-react";

import { CourseDetail } from "@/lib/data/courses";

interface CourseReviewsProps {
  initialCourse?: CourseDetail;
}

export default function CourseReviews({ initialCourse }: CourseReviewsProps = {}) {
  const reviews: Array<{
    id: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    likes: number;
  }> = [];

  const ratingValue = initialCourse?.rating || 5.0;

  return (
    <div id="reviews" className="space-y-3 sm:space-y-5 select-none text-white scroll-mt-28">
      {/* Reviews List or Clean Empty State */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Student Feedback ({reviews.length})</span>
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl bg-[#0e1320]/85 border border-white/10 hover:border-cyan-500/30 p-4 sm:p-5 space-y-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0 border border-cyan-500/20">
                      <Image
                        src={rev.avatar}
                        alt={rev.author}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {rev.author}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded font-semibold">
                          <CheckCircle className="w-2.5 h-2.5 text-cyan-400" />
                          Verified Student
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{rev.role}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-500 font-mono">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                  {rev.comment}
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center gap-4 text-xs text-gray-400">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.likes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 sm:p-8 rounded-2xl bg-[#0e1320]/85 border border-white/10 text-center space-y-2 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              No Student Reviews Yet
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-400 max-w-sm mx-auto font-normal leading-relaxed">
              Be the first enrolled student to share your learning experience and feedback for this masterclass!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
