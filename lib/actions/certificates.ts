"use server";

import { getCustomerProfile } from "@/lib/actions/auth";
import { getEnrolledCoursesAction } from "@/lib/actions/student";
import { getAllCoursesProgressAction } from "@/lib/actions/progress";
import { prisma, isPrismaReady } from "@/lib/db/prisma";
import { getLiveStorefrontCourses } from "@/lib/data/courses-db";
import { sendCertificateIssuedEmail } from "@/lib/mail";

export interface CertificateItem {
  id: string;
  courseSlug: string;
  title: string;
  issuedDate: string;
  grade: string;
  code: string;
  studentName: string;
  instructorName?: string;
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
    const ready = await isPrismaReady();

    for (const course of enrolledCourses) {
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

        const code = `SKL-${prefix}-${hash}`;
        const certItem: CertificateItem = {
          id: `cert-${course.slug}`,
          courseSlug: course.slug,
          title: `${course.title} Certificate`,
          issuedDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          grade: "Verified Completion (100%)",
          code,
          studentName,
          instructorName: course.instructor?.name || "Sakil Ahmed",
        };

        certificates.push(certItem);

        // Sync to PostgreSQL Certificate table if user has email
        if (ready && customer?.email) {
          try {
            const existing = await prisma.certificate.findUnique({
              where: { certificateNo: code },
            });

            await prisma.certificate.upsert({
              where: { certificateNo: code },
              create: {
                certificateNo: code,
                userEmail: customer.email,
                userName: studentName,
                courseSlug: course.slug,
                courseTitle: course.title,
                issueDate: new Date(),
              },
              update: {
                userName: studentName,
                courseTitle: course.title,
              },
            });

            // Dispatch congratulatory certificate email upon first issue
            if (!existing) {
              sendCertificateIssuedEmail({
                to: customer.email,
                name: studentName,
                courseTitle: course.title,
                certificateCode: code,
              }).catch((mailErr) => {
                console.warn("Certificate email dispatch warning:", mailErr);
              });
            }
          } catch (syncErr) {
            console.warn("Certificate DB sync warning:", syncErr);
          }
        }
      }
    }

    return certificates;
  } catch (err) {
    console.error("GET USER CERTIFICATES ERROR:", err);
    return [];
  }
}

/**
 * Server Action: Publicly verifies a certificate code (e.g. SKL-PR-12345)
 */
export async function verifyCertificateByCodeAction(code: string): Promise<{
  success: boolean;
  certificate?: CertificateItem;
  error?: string;
}> {
  if (!code || !code.trim()) {
    return { success: false, error: "Certificate verification code is required." };
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const ready = await isPrismaReady();
    if (ready) {
      const found = await prisma.certificate.findUnique({
        where: { certificateNo: cleanCode },
      });

      if (found) {
        return {
          success: true,
          certificate: {
            id: found.id,
            courseSlug: found.courseSlug,
            title: `${found.courseTitle} Certificate`,
            issuedDate: found.issueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            grade: "Verified Completion (100%)",
            code: found.certificateNo,
            studentName: found.userName,
            instructorName: "Sakil Ahmed",
          },
        };
      }
    }

    // Algorithmic fallback lookup matching course hashes
    const allCourses = await getLiveStorefrontCourses();
    for (const course of allCourses) {
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

      const expectedCode = `SKL-${prefix}-${hash}`;
      if (expectedCode === cleanCode) {
        return {
          success: true,
          certificate: {
            id: `cert-${course.slug}`,
            courseSlug: course.slug,
            title: `${course.title} Certificate`,
            issuedDate: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            grade: "Verified Completion (100%)",
            code: expectedCode,
            studentName: "Verified Graduate",
            instructorName: course.instructor?.name || "Sakil Ahmed",
          },
        };
      }
    }

    return {
      success: false,
      error: `Certificate with code "${cleanCode}" could not be verified. Please check the code and try again.`,
    };
  } catch (err: any) {
    console.error("VERIFY CERTIFICATE ACTION ERROR:", err);
    return {
      success: false,
      error: "An unexpected error occurred while verifying certificate.",
    };
  }
}
