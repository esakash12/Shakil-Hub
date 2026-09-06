import { notFound } from "next/navigation";
import CourseStickySidebar from "@/components/course/CourseStickySidebar";
import StickyBottomCTA from "@/components/course/StickyBottomCTA";
import { CoursePreviewProvider } from "@/components/course/CoursePreviewContext";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { getEnrolledCoursesAction, getPendingOrdersAction } from "@/lib/actions/student";
import { CourseDetail } from "@/lib/data/courses";

export const dynamic = "force-dynamic";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    notFound();
  }

  const [live, enrolledCourses, pendingOrders] = await Promise.all([
    getLiveCourseAction(slug),
    getEnrolledCoursesAction().catch(() => []),
    getPendingOrdersAction().catch(() => []),
  ]);

  if (!live.success || !live.course) {
    notFound();
  }

  const course: CourseDetail = live.course;
  const isEnrolled =
    Array.isArray(enrolledCourses) && enrolledCourses.some((c) => c.slug?.toLowerCase() === slug.toLowerCase());
  const isPending =
    !isEnrolled &&
    Array.isArray(pendingOrders) &&
    pendingOrders.some((o) => o.courseSlug?.toLowerCase() === slug.toLowerCase());

  return (
    <CoursePreviewProvider course={course}>
      <div className="relative min-h-screen text-white pb-2 lg:pb-0 selection:bg-cyan-500 selection:text-black">
        {/* Main 2-Column Grid Matrix: Left 7 Cols (Stacked Content) & Right 5 Cols (Widened Sticky Card) */}
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 py-3 sm:py-6 lg:py-8">
          {/* Left Column: Vertically Stacked Scroll Content (7 Cols) */}
          <div className="lg:col-span-7 min-w-0">{children}</div>

          {/* Right Column: Widened Sticky Video & Checkout Card (5 Cols) - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-5 min-w-0">
            <CourseStickySidebar
              initialCourse={course}
              slug={slug}
              isEnrolled={isEnrolled}
              isPending={isPending}
            />
          </aside>
        </div>

        {/* Mobile Sticky Bottom Floating CTA (Always persistent on mobile) */}
        <StickyBottomCTA
          initialCourse={course}
          slug={slug}
          isEnrolled={isEnrolled}
          isPending={isPending}
        />
      </div>
    </CoursePreviewProvider>
  );
}
