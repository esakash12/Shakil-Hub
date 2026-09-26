import { redirect, notFound } from "next/navigation";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";

export const dynamic = "force-dynamic";

interface DashboardLearnPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DashboardLearnPage({
  params,
}: DashboardLearnPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  const live = await getLiveCourseAction(slug);
  if (!live.success || !live.course) {
    notFound();
  }

  const allLessons =
    live.course.curriculum && live.course.curriculum.length > 0
      ? live.course.curriculum.flatMap((m) => m.lessons || [])
      : [];

  const firstLessonId = allLessons[0]?.id || "1";
  redirect(`/learn/${slug}/${firstLessonId}`);
}
