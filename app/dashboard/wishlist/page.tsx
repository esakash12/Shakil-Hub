import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight, Sparkles, BookOpen, Clock, Play, Trash2, Zap } from "lucide-react";
import { getWishlistCoursesAction } from "@/lib/actions/wishlist";
import { CourseDetail } from "@/lib/data/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WishlistPage() {
  const wishlistedCourses: CourseDetail[] = await getWishlistCoursesAction();

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Saved Courses</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Wishlist ({wishlistedCourses.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Keep track of masterclasses you are interested in enrolling in next.
        </p>
      </div>

      {wishlistedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlistedCourses.map((course) => (
            <div
              key={course.slug}
              className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]"
            >
              {/* Card Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
                {(course.thumbnail || course.image) ? (
                  <Image
                    src={course.thumbnail || course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 shadow-inner">
                      <Play className="w-4 h-4 fill-blue-400 ml-0.5" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-tight line-clamp-1">
                      {course.title}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-blue-600/80 backdrop-blur-md text-[10px] font-bold text-white">
                  {course.badge || "Masterclass"}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  {course.highlights?.hours || "12 Hours"}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] text-gray-400 block font-normal">
                    By {course.instructor?.name || "Sakil Ahmed"}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-bold text-white">
                      {course.price}
                    </span>
                    {course.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {course.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/checkout/${course.slug}`}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Enroll Now</span>
                  </Link>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium text-xs transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Premium Empty State */
        <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 p-10 sm:p-16 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-600/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
              <Heart className="w-8 h-8 fill-red-500/20" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Your wishlist is currently empty
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Browse through our masterclasses and tap the heart icon on any course to save it for later.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
