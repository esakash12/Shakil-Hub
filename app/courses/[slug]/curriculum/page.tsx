import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CurriculumPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) notFound();
  redirect(`/courses/${slug}#curriculum`);
}
