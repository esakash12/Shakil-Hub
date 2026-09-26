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

    // 1. Resolve authenticated customer email strictly from verified session
    const customer = await getCustomerProfile();
    if (!customer?.email) {
      return [];
    }
    const userEmail = customer.email.toLowerCase().trim();

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

    // Clean up any lingering legacy sakil_pending_orders cookie from student's browser
    if (cookieStore.has("sakil_pending_orders")) {
      cookieStore.delete("sakil_pending_orders");
    }

    if (!userEmail) {
      return [];
    }

    const userPhoneDigits = customer?.phone?.replace(/\D/g, "") || "";
    const userPhoneSuffix = userPhoneDigits.length >= 8 ? userPhoneDigits.slice(-8) : "";

    const { getPersistentOrders } = await import("@/lib/data/orders");
    const allPersistent = await getPersistentOrders();
    const studentOrders = allPersistent.filter((o) => {
      if (!o) return false;
      const orderEmail = (o.email || "").toLowerCase().trim();
      // Direct email match
      if (orderEmail && orderEmail === userEmail) return true;

      // Match by student's registered mobile number or dummy email containing mobile digits
      if (userPhoneSuffix) {
        const senderDigits = (o.senderNumber || "").replace(/\D/g, "");
        if (senderDigits.endsWith(userPhoneSuffix)) return true;
        if (orderEmail.includes(userPhoneSuffix)) return true;
      }

      return false;
    });

    const orderMap = new Map<string, PendingStudentOrder>();
    const seenTrx = new Set<string>();

    studentOrders.forEach((o) => {
      const canonicalNumber = o.orderNumber || o.id;
      const normTrx = (o.trxId || "").trim().toUpperCase();

      // Skip duplicate order with exact same TrxID
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
        courseTitle: o.courseTitle || "Masterclass / Digital Asset",
        amount: o.amount || 1299,
        paymentMethod: o.paymentMethod || "bKash",
        trxId: o.trxId || "N/A",
        senderNumber: o.senderNumber,
        status: o.status || "pending_verification",
        createdAt: o.createdAt || new Date().toISOString(),
        rejectionReason: o.rejectionReason,
      });
    });

    const orderList = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Enrich course and digital product titles and thumbnails with live metadata
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
            } else {
              // Fallback for digital assets / shop products
              const { getShopProductBySlug } = await import("@/lib/data/shop");
              const shopProd = await getShopProductBySlug(item.courseSlug);
              if (shopProd) {
                return {
                  ...item,
                  courseTitle: shopProd.title || item.courseTitle,
                  courseThumbnail: shopProd.thumbnail || item.courseThumbnail,
                };
              }
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

export interface StudentProductItem {
  id: string;
  orderNumber: string;
  slug: string;
  title: string;
  category: string;
  thumbnail: string;
  price: number;
  deliveryMethod?: {
    type: string;
    label?: string;
    instructions?: string;
    downloadUrl?: string;
    licenseKeySample?: string;
  };
  purchasedAt: string;
}

/**
 * Server Action: Fetches all approved digital products/assets purchased by the student
 */
export async function getStudentDigitalProductsAction(): Promise<StudentProductItem[]> {
  try {
    const allOrders = await getAllStudentOrdersAction();
    const approvedOrders = allOrders.filter((o) => o.status === "approved");

    const { getShopProductBySlug } = await import("@/lib/data/shop");
    const products: StudentProductItem[] = [];

    for (const order of approvedOrders) {
      if (order.courseSlug) {
        const shopProd = await getShopProductBySlug(order.courseSlug);
        if (shopProd) {
          products.push({
            id: order.id,
            orderNumber: order.orderNumber,
            slug: shopProd.slug,
            title: shopProd.title,
            category: shopProd.category || "Digital Product",
            thumbnail: shopProd.thumbnail || order.courseThumbnail || "",
            price: Number(order.amount) || Number(shopProd.price) || 0,
            deliveryMethod: shopProd.deliveryMethod,
            purchasedAt: order.createdAt,
          });
        }
      }
    }

    return products;
  } catch (err) {
    console.error("GET STUDENT DIGITAL PRODUCTS ERROR:", err);
    return [];
  }
}

