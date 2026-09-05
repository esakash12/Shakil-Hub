import React from "react";
import type { Metadata } from "next";
import CoursesCatalogClient from "@/components/course/CoursesCatalogClient";
import { getLiveStorefrontCourses } from "@/lib/data/courses";
import { CourseProps } from "@/components/ui/CourseCard";

export const metadata: Metadata = {
  title: "All Masterclasses | Sakil Hub",
  description:
    "Explore our complete curriculum of video editing, VFX, and color grading masterclasses.",
};

export const dynamic = "force-dynamic";

export default async function CoursesCatalogPage() {
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

  return <CoursesCatalogClient initialCourses={formattedCourses} />;
}
