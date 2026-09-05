"use server";

import { getCustomerProfile } from "@/lib/actions/auth";
import { getEnrolledCoursesAction } from "@/lib/actions/student";
import { getAllCoursesProgressAction } from "@/lib/actions/progress";

export interface CertificateItem {
  id: string;
  courseSlug: string;
  title: string;
  issuedDate: string;
  grade: string;
  code: string;
  studentName: string;
}

/**
 * Server Action: Fetches verified certificates for the current logged in student.
 * Certificates are unlocked when an enrolled course reaches 100% completion.
 */
export async function getUserCertificatesAction(): Promise<CertificateItem[]> {
  try {
    const [customer, enrolledCourses, progressMap] = await Promise.all([
      getCustomerProfile(),
      getEnrolledCoursesAction(),
      getAllCoursesProgressAction(),
    ]);

    const studentName = customer?.first_name
      ? `${customer.first_name} ${customer.last_name || ""}`.trim()
      : "Student";

    const certificates: CertificateItem[] = [];

    enrolledCourses.forEach((course) => {
      const progress = progressMap[course.slug];
      // Check if completed 100%
      if (progress && progress.percentage >= 100) {
        const hash = Math.abs(
          course.slug
            .split("")
            .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
        )
          .toString()
          .slice(0, 5);

        const prefix = course.slug
          .split("-")
          .map((w) => w[0].toUpperCase())
          .slice(0, 2)
          .join("");

        certificates.push({
          id: `cert-${course.slug}`,
          courseSlug: course.slug,
          title: `${course.title} Certificate`,
          issuedDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          grade: "Verified Completion (100%)",
          code: `SKL-${prefix}-${hash}`,
          studentName,
        });
      }
    });

    return certificates;
  } catch (err) {
    console.error("GET USER CERTIFICATES ERROR:", err);
    return [];
  }
}
