import React, { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import PopularCourses from "@/components/home/PopularCourses";
import WhatYouWillLearn from "@/components/home/WhatYouWillLearn";
import PreFooterStatsBar from "@/components/layout/PreFooterStatsBar";
import { getHomeCmsAction } from "@/lib/actions/home";

function CoursesSkeleton() {
  return (
    <section className="py-6 sm:py-10 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <div className="h-6 w-40 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-6 w-28 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-4 animate-pulse"
            >
              <div className="w-full aspect-video rounded-xl bg-white/5" />
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
              <div className="pt-2 flex justify-between items-center">
                <div className="h-5 w-20 bg-white/10 rounded" />
                <div className="h-8 w-24 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const homeCms = await getHomeCmsAction();

  return (
    <div className="relative animate-in fade-in duration-500">
      {/* 100vh Above The Fold Hero Section */}
      <HeroSection cms={homeCms} />

      {/* Dynamic Courses Section with Suspense Boundary */}
      <Suspense fallback={<CoursesSkeleton />}>
        <PopularCourses />
      </Suspense>

      {/* Value Pillars Section */}
      <WhatYouWillLearn
        title={homeCms.whatYouWillLearnTitle}
        items={homeCms.whatYouWillLearnItems}
      />

      {/* Platform Trust & Statistics (Exclusive to Root Home Page) */}
      <PreFooterStatsBar />
    </div>
  );
}
