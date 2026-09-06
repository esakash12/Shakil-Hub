"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { getCourseBySlug, getFirstLessonId, CourseDetail } from "@/lib/data/courses";
import { getAllCoursesProgressAction } from "@/lib/actions/progress";
import { getApprovedSlugsByEmail } from "@/lib/data/orders";
import {
  findCustomerByEmail,
  deleteCustomerNotice,
  CustomerNotice,
} from "@/lib/data/customers";

export interface EnrolledCourseItem {
  slug: string;
  title: string;
  subtitle?: string;
  instructor: {
    name: string;
    role?: string;
    avatar?: string;
  };
  image: string;
  thumbnail?: string;
  badge: string;
  category?: string;
  highlights: {
    hours: string;
    lessons: string;
    access?: string;
    certificate?: string;
  };
  progressPercentage?: number;
  completedLessons?: number;
  totalLessons?: number;
  firstLessonId?: string;
}

/**
 * Server Action: Fetches the approved and active enrolled courses for the current student.
 * Inspects secure session cookies, approved order records, admin entitlements, and computes real lesson completion stats.
 */
export async function getEnrolledCoursesAction(): Promise<EnrolledCourseItem[]> {
  try {
    const cookieStore = await cookies();
    const slugSet = new Set<string>();
    const revokedSet = new Set<string>();

    // 1. Resolve authenticated customer email
    let userEmail = "";
    const customer = await getCustomerProfile();
    if (customer?.email) {
      userEmail = customer.email.toLowerCase().trim();
    } else {
      const infoCookie = cookieStore.get("sakil_customer_info")?.value;
      if (infoCookie) {
        try {
          const parsed = JSON.parse(infoCookie);
          if (parsed.email) userEmail = parsed.email.toLowerCase().trim();
        } catch {}
      }
    }

    // Strict Security: Unauthenticated guests cannot have enrolled courses
    if (!userEmail) {
      return [];
    }

    // 4. If customer email is available, query persistent orders and admin database entitlements
    if (userEmail) {
      // 4a. Query persistent approved orders from orders.json
      try {
        const { getPersistentOrders } = await import("@/lib/data/orders");
        const allOrders = await getPersistentOrders();
        allOrders.forEach((o) => {
          if (
            o.email &&
            o.email.toLowerCase().trim() === userEmail &&
            (o.status === "approved" || (o as any).status === "verified")
          ) {
            if (o.courseSlug) {
              slugSet.add(o.courseSlug.trim().toLowerCase());
            }
          }
        });
      } catch (err) {
        console.error("GET PERSISTENT ORDERS FOR STUDENT ERROR:", err);
      }

      // 4b. Query customer record from customers.json
      try {
        const dbCust = await findCustomerByEmail(userEmail);
        if (dbCust) {
          // Add custom admin-granted courses
          if (Array.isArray(dbCust.customEnrolledSlugs)) {
            dbCust.customEnrolledSlugs.forEach((s) => {
              if (typeof s === "string" && s.trim()) {
                slugSet.add(s.trim().toLowerCase());
              }
            });
          }
          // Collect admin-revoked courses
          if (Array.isArray(dbCust.revokedSlugs)) {
            dbCust.revokedSlugs.forEach((s) => {
              if (typeof s === "string" && s.trim()) {
                revokedSet.add(s.trim().toLowerCase());
              }
            });
          }
        }
      } catch (err) {
        console.error("GET CUSTOMER DB RECORD ERROR:", err);
      }
    }

    // 5. Remove any revoked slugs
    revokedSet.forEach((revoked) => {
      slugSet.delete(revoked);
    });

    const enrolledSlugs = Array.from(slugSet);

    // If no enrollments exist, return empty array immediately
    if (enrolledSlugs.length === 0) {
      return [];
    }

    // 6. Fetch real persistent lesson progress map
    const progressMap = await getAllCoursesProgressAction();

    // 7. Fetch structured course metadata for each enrolled course
    const coursePromises = enrolledSlugs.map(async (slug) => {
      let course: CourseDetail | null = null;
      try {
        const live = await getLiveCourseAction(slug);
        if (live.success && live.course) {
          course = live.course;
        }
      } catch {}

      if (!course) {
        course = getCourseBySlug(slug);
      }

      const totalLessons =
        course.curriculum && course.curriculum.length > 0
          ? course.curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
          : 24;

      const progress = progressMap[slug];
      const completedCount = progress ? progress.completedCount : 0;
      const progressPct =
        totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      const firstLessonId = getFirstLessonId(course);

      const item: EnrolledCourseItem = {
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        instructor: {
          name: course.instructor?.name || "Sakil Ahmed",
          role: course.instructor?.role,
          avatar: course.instructor?.avatar,
        },
        image: course.thumbnail || course.image,
        thumbnail: course.thumbnail || course.image,
        badge: course.badge || "Masterclass",
        category: course.category,
        highlights: {
          hours: course.highlights?.hours || "12 Hours",
          lessons: `${totalLessons} Lessons`,
          access: course.highlights?.access || "Lifetime Access",
          certificate: course.highlights?.certificate || "Certificate Included",
        },
        progressPercentage: progressPct,
        completedLessons: completedCount,
        totalLessons,
        firstLessonId,
      };

      return item;
    });

    const courses = await Promise.all(coursePromises);
    return courses;
  } catch (err) {
    console.error("GET ENROLLED COURSES ACTION ERROR:", err);
    return [];
  }
}

/**
 * Server Action: Fetches active admin notices/alerts for the current student
 */
export async function getStudentNoticesAction(): Promise<CustomerNotice[]> {
  try {
    const customer = await getCustomerProfile();
    if (!customer?.email) return [];

    const dbCust = await findCustomerByEmail(customer.email);
    return dbCust?.notices || [];
  } catch (err) {
    console.error("GET STUDENT NOTICES ERROR:", err);
    return [];
  }
}

/**
 * Server Action: Dismisses a specific admin notice for the student
 */
export async function dismissStudentNoticeAction(
  noticeId: string
): Promise<{ success: boolean }> {
  try {
    const customer = await getCustomerProfile();
    if (!customer?.email) return { success: false };

    const success = await deleteCustomerNotice(customer.email, noticeId);
    revalidatePath("/dashboard");
    return { success };
  } catch (err) {
    console.error("DISMISS NOTICE ERROR:", err);
    return { success: false };
  }
}

export interface PendingStudentOrder {
  id: string;
  orderNumber: string;
  courseSlug: string;
  courseTitle: string;
  courseThumbnail?: string;
  amount: number | string;
  paymentMethod: string;
  trxId: string;
  senderNumber?: string;
  status: "pending_verification" | "pending" | "processing" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
}

/**
 * Server Action: Fetches all orders for the current student (session + persistent disk store)
 */
export async function getAllStudentOrdersAction(): Promise<PendingStudentOrder[]> {
  try {
    const cookieStore = await cookies();
    const customer = await getCustomerProfile();
    const userEmail = customer?.email?.toLowerCase().trim() || "";

    const orderMap = new Map<string, PendingStudentOrder>();

    // 1. Check orders in session cookies
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const sessionOrders: any[] = JSON.parse(pendingOrdersRaw);
        if (Array.isArray(sessionOrders)) {
          sessionOrders.forEach((o) => {
            if (o) {
              const id = o.orderId || o.id || o.orderNumber || o.trxId;
              if (id) {
                orderMap.set(id, {
                  id,
                  orderNumber: o.orderNumber || o.orderId || id,
                  courseSlug: o.courseSlug || "",
                  courseTitle: o.courseTitle || "Masterclass",
                  courseThumbnail: o.thumbnail || o.image,
                  amount: o.amount || 1499,
                  paymentMethod: o.paymentMethod || o.method || "bKash",
                  trxId: o.trxId || "N/A",
                  senderNumber: o.senderNumber,
                  status: o.status || "pending_verification",
                  createdAt: o.createdAt || new Date().toISOString(),
                  rejectionReason: o.rejectionReason,
                });
              }
            }
          });
        }
      } catch {}
    }

    // 2. Check persistent orders from orders.json for the authenticated student email
    if (userEmail) {
      try {
        const { getPersistentOrders } = await import("@/lib/data/orders");
        const persistentOrders = await getPersistentOrders();
        persistentOrders.forEach((o) => {
          if (o.email && o.email.toLowerCase().trim() === userEmail) {
            const id = o.id || o.orderNumber || o.trxId;
            orderMap.set(id, {
              id,
              orderNumber: o.orderNumber || id,
              courseSlug: o.courseSlug || "",
              courseTitle: o.courseTitle || "Masterclass",
              amount: o.amount || 1499,
              paymentMethod: o.paymentMethod || "bKash",
              trxId: o.trxId || "N/A",
              senderNumber: o.senderNumber,
              status: o.status || "pending_verification",
              createdAt: o.createdAt || new Date().toISOString(),
              rejectionReason: o.rejectionReason,
            });
          }
        });
      } catch (err) {
        console.error("GET PERSISTENT ORDERS FOR STUDENT ERROR:", err);
      }
    }

    const orderList = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Enrich course titles and thumbnails with live course metadata
    const enrichedList = await Promise.all(
      orderList.map(async (item) => {
        try {
          if (item.courseSlug) {
            const live = await getLiveCourseAction(item.courseSlug);
            if (live?.success && live.course) {
              return {
                ...item,
                courseTitle: live.course.title || item.courseTitle,
                courseThumbnail:
                  live.course.thumbnail ||
                  live.course.image ||
                  item.courseThumbnail,
              };
            }
          }
        } catch {}
        return item;
      })
    );

    return enrichedList;
  } catch (err) {
    console.error("GET ALL STUDENT ORDERS ACTION ERROR:", err);
    return [];
  }
}

/**
 * Server Action: Fetches pending verification orders for the current student
 */
export async function getPendingOrdersAction(): Promise<PendingStudentOrder[]> {
  const allOrders = await getAllStudentOrdersAction();
  return allOrders.filter(
    (o) =>
      o.status === "pending_verification" ||
      (o.status as any) === "pending" ||
      (o.status as any) === "processing"
  );
}
