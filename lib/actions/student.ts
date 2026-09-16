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
import { getSessionCookieOptions } from "@/lib/security/cookies";

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
    const rawNotices = dbCust?.notices || [];
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();

    return rawNotices.filter((n) => {
      if (!n) return false;
      const id = n.id ? String(n.id).trim() : "";
      const content = `${(n.title || "").trim().toLowerCase()}:::${(n.message || "").trim().toLowerCase()}`;

      if (id && seenIds.has(id)) return false;
      if (content !== ":::" && seenContent.has(content)) return false;

      if (id) seenIds.add(id);
      if (content !== ":::") seenContent.add(content);
      return true;
    });
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
    const seenTrx = new Set<string>();

    // 1. If user is authenticated, query persistent database orders as the primary authority
    let persistentOrders: any[] = [];
    if (userEmail) {
      try {
        const { getPersistentOrders } = await import("@/lib/data/orders");
        const allPersistent = await getPersistentOrders();
        persistentOrders = allPersistent.filter(
          (o) => o.email && o.email.toLowerCase().trim() === userEmail
        );
      } catch (err) {
        console.error("GET PERSISTENT ORDERS FOR STUDENT ERROR:", err);
      }
    }

    // 2. Add persistent orders from PostgreSQL to orderMap (deduplicating by orderNumber & trxId)
    persistentOrders.forEach((o) => {
      const canonicalNumber = o.orderNumber || o.id;
      const normTrx = (o.trxId || "").trim().toUpperCase();

      // If duplicate order with same TrxID already processed, skip duplicate
      if (normTrx && normTrx !== "N/A" && normTrx !== "TRX-VERIFY" && seenTrx.has(normTrx)) {
        return;
      }
      if (normTrx && normTrx !== "N/A" && normTrx !== "TRX-VERIFY") {
        seenTrx.add(normTrx);
      }

      orderMap.set(canonicalNumber, {
        id: canonicalNumber,
        orderNumber: canonicalNumber,
        courseSlug: o.courseSlug || "",
        courseTitle: o.courseTitle || "Masterclass",
        amount: o.amount || 1299,
        paymentMethod: o.paymentMethod || "bKash",
        trxId: o.trxId || "N/A",
        senderNumber: o.senderNumber,
        status: o.status || "pending_verification",
        createdAt: o.createdAt || new Date().toISOString(),
        rejectionReason: o.rejectionReason,
      });
    });

    // 3. Inspect session cookie: reconcile, sync, or purge stale/deleted orders
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const sessionOrders: any[] = JSON.parse(pendingOrdersRaw);
        if (Array.isArray(sessionOrders)) {
          if (userEmail) {
            // Student is logged in:
            // Cookie orders that belong to this student must be reconciled against the database.
            // If the order was deleted in the DB by the admin, remove it from the cookie!
            // If the order exists in DB, synchronize its status to match the DB!
            const updatedCookieOrders = sessionOrders
              .filter((so) => {
                const soEmail = (so.email || "").toLowerCase().trim();
                if (soEmail === userEmail || !soEmail) {
                  // If order belongs to this student, check if it still exists in persistentOrders
                  const existsInDb = persistentOrders.some(
                    (po) =>
                      (po.orderNumber && (po.orderNumber === so.orderNumber || po.orderNumber === so.orderId)) ||
                      (po.id && (po.id === so.orderId || po.id === so.id)) ||
                      (po.trxId && so.trxId && po.trxId.toLowerCase() === so.trxId.toLowerCase())
                  );
                  return existsInDb;
                }
                return true;
              })
              .map((so) => {
                const match = persistentOrders.find(
                  (po) =>
                    (po.orderNumber && (po.orderNumber === so.orderNumber || po.orderNumber === so.orderId)) ||
                    (po.id && (po.id === so.orderId || po.id === so.id)) ||
                    (po.trxId && so.trxId && po.trxId.toLowerCase() === so.trxId.toLowerCase())
                );
                if (match) {
                  return {
                    ...so,
                    status: match.status,
                    rejectionReason: match.rejectionReason,
                  };
                }
                return so;
              });

            cookieStore.set(
              "sakil_pending_orders",
              JSON.stringify(updatedCookieOrders),
              getSessionCookieOptions(60 * 60 * 24 * 30)
            );
          } else {
            // Guest mode (unauthenticated): use session orders
            sessionOrders.forEach((o) => {
              if (o) {
                const canonicalNumber = o.orderNumber || o.orderId || o.id;
                const normTrx = (o.trxId || "").trim().toUpperCase();
                if (normTrx && normTrx !== "N/A" && normTrx !== "TRX-VERIFY" && seenTrx.has(normTrx)) {
                  return;
                }
                if (normTrx && normTrx !== "N/A" && normTrx !== "TRX-VERIFY") {
                  seenTrx.add(normTrx);
                }
                if (canonicalNumber && !orderMap.has(canonicalNumber)) {
                  orderMap.set(canonicalNumber, {
                    id: canonicalNumber,
                    orderNumber: canonicalNumber,
                    courseSlug: o.courseSlug || "",
                    courseTitle: o.courseTitle || "Masterclass",
                    courseThumbnail: o.thumbnail || o.image,
                    amount: o.amount || 1299,
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
        }
      } catch {}
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
