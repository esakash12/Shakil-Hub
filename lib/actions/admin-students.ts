"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getPersistentCustomers,
  savePersistentCustomer,
  findCustomerByEmail,
  updateCustomerStatus,
  addCustomerNotice,
  deleteCustomerNotice,
  grantCustomerCourse,
  revokeCustomerCourse,
  deletePersistentCustomer,
  CustomerRecord,
  CustomerNotice,
} from "@/lib/data/customers";
import { getPersistentOrders, OrderItem } from "@/lib/data/orders";

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

const ADMIN_API_KEY =
  process.env.MEDUSA_API_KEY || "sakil_headless_lms_admin_key";

export interface AdminStudentItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrolledCount: number;
  courses: string[];
  customEnrolledSlugs: string[];
  revokedSlugs: string[];
  notices: CustomerNotice[];
  totalSpent: number;
  joined: string;
  status: "active" | "banned" | "temp_banned" | "verified" | "pending";
  banReason?: string;
  tempBanUntil?: string;
}

/**
 * Server Action: Fetch all real registered student accounts, statuses, & masterclass enrollments
 */
export async function fetchAdminStudentsAction(): Promise<{
  success: boolean;
  students: AdminStudentItem[];
}> {
  try {
    // 1. Fetch registered customer accounts
    const registeredCustomers: CustomerRecord[] = await getPersistentCustomers();

    // 2. Try fetching Medusa backend customers if running
    let medusaCustomers: CustomerRecord[] = [];
    try {
      const res = await fetch(`${BACKEND_URL}/admin/customers?limit=50`, {
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": ADMIN_API_KEY,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.customers && Array.isArray(data.customers)) {
          medusaCustomers = data.customers.map((c: any) => ({
            id: c.id,
            firstName: c.first_name || "Student",
            lastName: c.last_name || "",
            email: c.email,
            phone: c.phone,
            createdAt: c.created_at || new Date().toISOString(),
          }));
        }
      }
    } catch {}

    // 3. Fetch all orders
    const orders: OrderItem[] = await getPersistentOrders();

    // Merge registered customers
    const studentMap: Record<string, AdminStudentItem> = {};

    // Register all real student accounts
    const allCustomers = [...registeredCustomers, ...medusaCustomers];
    allCustomers.forEach((cust) => {
      const email = cust.email.toLowerCase().trim();
      if (!email) return;

      const fullName = `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || "Student";
      studentMap[email] = {
        id: cust.id || `std-${email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`,
        name: fullName,
        email,
        phone: cust.phone || undefined,
        enrolledCount: 0,
        courses: [],
        customEnrolledSlugs: cust.customEnrolledSlugs || [],
        revokedSlugs: cust.revokedSlugs || [],
        notices: cust.notices || [],
        totalSpent: 0,
        joined: new Date(cust.createdAt || Date.now()).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: cust.status || "active",
        banReason: cust.banReason,
        tempBanUntil: cust.tempBanUntil,
      };
    });

    // Correlate orders & payments
    orders.forEach((order) => {
      const email = (order.email || "").toLowerCase().trim();
      if (!email) return;

      if (!studentMap[email]) {
        // If guest purchased before registering
        studentMap[email] = {
          id: `std-${email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`,
          name: order.studentName || "Guest Student",
          email,
          phone: order.senderNumber || undefined,
          enrolledCount: 0,
          courses: [],
          customEnrolledSlugs: [],
          revokedSlugs: [],
          notices: [],
          totalSpent: 0,
          joined: new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: "pending",
        };
      }

      const entry = studentMap[email];
      if (order.senderNumber && !entry.phone) {
        entry.phone = order.senderNumber;
      }

      if (order.status === "approved") {
        if (order.courseTitle && !entry.courses.includes(order.courseTitle)) {
          // Check if not explicitly revoked
          const isRevoked = entry.revokedSlugs.some(
            (s) => s.toLowerCase() === (order.courseSlug || "").toLowerCase()
          );
          if (!isRevoked) {
            entry.courses.push(order.courseTitle);
            entry.enrolledCount = entry.courses.length;
          }
        }
        entry.totalSpent += Number(order.amount) || 0;
        if (entry.status !== "banned" && entry.status !== "temp_banned") {
          entry.status = "verified";
        }
      }
    });

    // Add admin custom granted courses
    Object.values(studentMap).forEach((entry) => {
      if (entry.customEnrolledSlugs && entry.customEnrolledSlugs.length > 0) {
        entry.customEnrolledSlugs.forEach((slug) => {
          const formatted = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          if (!entry.courses.includes(formatted)) {
            entry.courses.push(formatted);
          }
        });
        entry.enrolledCount = entry.courses.length;
      }
    });

    const students = Object.values(studentMap);

    return {
      success: true,
      students,
    };
  } catch (err: any) {
    console.error("FETCH ADMIN STUDENTS ERROR:", err.message || err);
    return {
      success: false,
      students: [],
    };
  }
}

/**
 * Server Action: Update student account status (active, banned, temp_banned)
 */
export async function updateStudentStatusAction(
  email: string,
  status: "active" | "banned" | "temp_banned",
  banReason?: string,
  tempBanDays?: number
): Promise<{ success: boolean; error?: string }> {
  if (!email) return { success: false, error: "Email is required" };

  try {
    let tempBanUntil: string | undefined = undefined;
    if (status === "temp_banned" && tempBanDays) {
      const date = new Date();
      date.setDate(date.getDate() + Number(tempBanDays));
      tempBanUntil = date.toISOString();
    }

    await updateCustomerStatus(email, status, banReason, tempBanUntil);

    revalidatePath("/admin/students");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("UPDATE STUDENT STATUS ERROR:", err.message || err);
    return { success: false, error: err.message || "Failed to update student status" };
  }
}

/**
 * Server Action: Send a custom admin notice / alert to a student
 */
export async function sendStudentNoticeAction(
  email: string,
  notice: {
    title: string;
    message: string;
    type: "info" | "warning" | "alert" | "success";
  }
): Promise<{ success: boolean; notice?: CustomerNotice; error?: string }> {
  if (!email || !notice.title || !notice.message) {
    return { success: false, error: "Email, title, and message are required" };
  }

  try {
    const createdNotice = await addCustomerNotice(email, notice);
    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    return { success: true, notice: createdNotice || undefined };
  } catch (err: any) {
    console.error("SEND STUDENT NOTICE ERROR:", err.message || err);
    return { success: false, error: err.message || "Failed to send student notice" };
  }
}

/**
 * Server Action: Delete an admin notice sent to a student
 */
export async function deleteStudentNoticeAction(
  email: string,
  noticeId: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !noticeId) {
    return { success: false, error: "Email and noticeId are required" };
  }

  try {
    const success = await deleteCustomerNotice(email, noticeId);
    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    return { success };
  } catch (err: any) {
    console.error("DELETE STUDENT NOTICE ERROR:", err.message || err);
    return { success: false, error: err.message || "Failed to delete student notice" };
  }
}

/**
 * Server Action: Grant a student direct access to a specific course
 */
export async function grantStudentCourseAccessAction(
  email: string,
  courseSlug: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !courseSlug) {
    return { success: false, error: "Email and courseSlug are required" };
  }

  try {
    await grantCustomerCourse(email, courseSlug);
    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (err: any) {
    console.error("GRANT COURSE ACCESS ERROR:", err.message || err);
    return { success: false, error: err.message || "Failed to grant course access" };
  }
}

/**
 * Server Action: Revoke a student's access to a specific course
 */
export async function revokeStudentCourseAccessAction(
  email: string,
  courseSlug: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !courseSlug) {
    return { success: false, error: "Email and courseSlug are required" };
  }

  try {
    await revokeCustomerCourse(email, courseSlug);
    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (err: any) {
    console.error("REVOKE COURSE ACCESS ERROR:", err.message || err);
    return { success: false, error: err.message || "Failed to revoke course access" };
  }
}

/**
 * Server Action: Delete a student account completely
 */
export async function deleteStudentAccountAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!email) return { success: false, error: "Email is required" };

  try {
    await deletePersistentCustomer(email);

    // Also attempt deleting on Medusa backend
    try {
      const customersRes = await fetch(`${BACKEND_URL}/admin/customers?q=${encodeURIComponent(email)}`, {
        headers: {
          "Content-Type": "application/json",
          "x-medusa-access-token": ADMIN_API_KEY,
        },
        cache: "no-store",
      });
      if (customersRes.ok) {
        const data = await customersRes.json();
        const found = data.customers?.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());
        if (found?.id) {
          await fetch(`${BACKEND_URL}/admin/customers/${found.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-medusa-access-token": ADMIN_API_KEY,
            },
            cache: "no-store",
          });
        }
      }
    } catch {}

    revalidatePath("/admin/students");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("DELETE STUDENT ACCOUNT ERROR:", err.message || err);
    return { success: false, error: err.message || "Failed to delete student account" };
  }
}
