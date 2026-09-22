import React from "react";

export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 select-none animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3 max-w-xl">
          <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse" />
          <div className="h-8 sm:h-10 w-3/4 bg-white/10 rounded-2xl animate-pulse" />
          <div className="h-4 w-full bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-white/5 border border-white/10 shrink-0 animate-pulse"
            />
          ))}
        </div>

        {/* 3-Column Course Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#090d16] border border-white/5 overflow-hidden flex flex-col justify-between space-y-4 p-4 shadow-sm"
            >
              {/* Thumbnail Shimmer */}
              <div className="relative aspect-video w-full rounded-xl bg-white/5 overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
              </div>

              {/* Course Meta Info */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-4 w-14 bg-white/10 rounded-full animate-pulse" />
                </div>
                <div className="h-5 w-5/6 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded-md animate-pulse" />
                <div className="h-3 w-4/5 bg-white/5 rounded-md animate-pulse" />
              </div>

              {/* Bottom Price & Button */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="h-6 w-20 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-8 w-24 bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
