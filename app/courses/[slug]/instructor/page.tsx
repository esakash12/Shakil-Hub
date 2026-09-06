import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface InstructorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function InstructorPage({ params }: InstructorPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) notFound();
  redirect(`/courses/${slug}#instructor`);
}
