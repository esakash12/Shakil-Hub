import React from "react";
import Link from "next/link";
import PopularCoursesList from "./PopularCoursesList";
import { CourseProps } from "@/components/ui/CourseCard";
import { getLiveStorefrontCourses } from "@/lib/data/courses";
import { Sparkles, ArrowRight, Video } from "lucide-react";

export default async function PopularCourses() {
  const liveCourses = await getLiveStorefrontCourses();

  const formattedCourses: CourseProps[] = liveCourses.map((c) => ({
    id: c.slug,
    title: c.title,
    category: c.category,
    description: c.subtitle || c.description,
    image: c.image,
    price: c.price,
    originalPrice: c.originalPrice,
    rating: c.rating,
    reviewsCount: c.reviewsCount,
  }));

  if (formattedCourses.length === 0) {
    return (
      <section id="courses" className="py-12 sm:py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-white/[0.02] border border-white/5 p-8 sm:p-14 text-center overflow-hidden backdrop-blur-xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Video className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>Next Drop Coming</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  New Masterclasses Dropping Soon!
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                  Our instructors are finalizing brand-new 4K project files and lessons. Check back shortly or browse our curriculum overview.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/instructors"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Meet Our Instructors</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <PopularCoursesList courses={formattedCourses} />;
}
