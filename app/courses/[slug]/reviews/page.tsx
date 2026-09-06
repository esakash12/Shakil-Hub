import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ReviewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) notFound();
  redirect(`/courses/${slug}#reviews`);
}
