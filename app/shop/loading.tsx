import React from "react";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-6 pb-16 select-none animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Filters & Search Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="h-10 w-full sm:w-72 bg-white/5 rounded-xl animate-pulse" />
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full bg-white/5 border border-white/10 shrink-0 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 3/4-Column Product Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#0b101d] border border-white/5 overflow-hidden flex flex-col justify-between p-3.5 space-y-3"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full rounded-xl bg-white/5 overflow-hidden animate-pulse" />

              {/* Title & Badge */}
              <div className="space-y-2">
                <div className="h-4 w-16 bg-white/10 rounded-full animate-pulse" />
                <div className="h-5 w-4/5 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded-md animate-pulse" />
              </div>

              {/* Price & Buy Button */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="h-5 w-16 bg-white/10 rounded-md animate-pulse" />
                <div className="h-8 w-20 bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
