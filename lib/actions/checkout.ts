"use server";

import { cookies } from "next/headers";
import { clearCartAction } from "@/lib/actions/cart";
import { getSessionCookieOptions } from "@/lib/security/cookies";
import { getCourseBySlug, getLiveCourseBySlug, CourseDetail } from "@/lib/data/courses";
import { getShopProductBySlug } from "@/lib/data/shop";
import { savePersistentOrder } from "@/lib/data/orders";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";
import {
  manualCheckoutPayloadSchema,
  emailSchema,
  bangladeshiPhoneSchema,
} from "@/lib/security/schemas";

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000";

const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export interface ManualCheckoutInput {
  courseSlug: string;
  senderNumber: string;
  trxId: string;
  paymentMethod?: "bkash" | "nagad" | "rocket" | "card";
  fullName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  itemType?: "course" | "product";
}

export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  courseSlug: string;
  courseTitle: string;
  amount: number;
  paymentMethod: string;
  senderNumber: string;
  trxId: string;
  fullName: string;
  email: string;
  whatsappNumber?: string;
  createdAt: string;
  status: "pending_verification" | "verified" | "completed";
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  courseSlug?: string;
  error?: string;
}

function getMedusaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (PUBLISHABLE_API_KEY) {
    headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY;
  }
  return headers;
}

/**
 * Server Action: Processes manual mobile money transfer (bKash/Nagad/Rocket) course & product checkout.
 * Creates Medusa Cart & Order, saves verification metadata, and tracks student enrollment.
 */
export async function processManualCheckout(
  input: ManualCheckoutInput
): Promise<CheckoutResult> {
  // 1. IP Rate Limiting (Anti-Spam & Brute-Force: Max 5 checkout submissions per IP per minute)
  const clientIp = await getClientIp();
  const rateLimit = checkRateLimit(`checkout_${clientIp}`, 5, 60 * 1000);
  if (!rateLimit.success) {
    return {
      success: false,
      error: rateLimit.error || "Too many requests. Please wait a moment.",
    };
  }

  // 2. Anti-XSS & Payload Sanitization
  const sanitized = sanitizeObject(input);

  // 3. Strict Zod Schema Validation
  const validation = manualCheckoutPayloadSchema.safeParse(sanitized);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Invalid checkout information.";
    return {
      success: false,
      error: firstError,
    };
  }

  const validData = validation.data;
  const courseSlug = validData.courseSlug;
  const senderNumber = validData.senderNumber;
  const trxId = validData.trxId;
  const paymentMethod = validData.paymentMethod;
  const cleanFullName = validData.fullName;
  const itemType = validData.itemType;

  let cleanEmail = validData.email || "";
  let cleanPhone = validData.phone || senderNumber;
  let cleanWhatsapp = validData.whatsappNumber || cleanPhone;

  if (itemType === "course") {
    const emailValidation = emailSchema.safeParse(cleanEmail);
    if (!emailValidation.success) {
      return {
        success: false,
        error: "Please provide a valid email address for student dashboard access.",
      };
    }
    cleanEmail = emailValidation.data;

    const phoneValidation = bangladeshiPhoneSchema.safeParse(cleanPhone);
    if (!phoneValidation.success) {
      return {
        success: false,
        error: "Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX).",
      };
    }
    cleanPhone = phoneValidation.data;

    const whatsappValidation = bangladeshiPhoneSchema.safeParse(cleanWhatsapp);
    if (!whatsappValidation.success) {
      return {
        success: false,
        error: "Please provide a valid 11-digit WhatsApp number for student support.",
      };
    }
    cleanWhatsapp = whatsappValidation.data;
  } else {
    // For Digital Product (Shop): minimal requirements are Full Name and WhatsApp Number
    const whatsappValidation = bangladeshiPhoneSchema.safeParse(cleanWhatsapp);
    if (!whatsappValidation.success) {
      return {
        success: false,
        error: "Please provide a valid 11-digit WhatsApp number for digital asset dispatch.",
      };
    }
    cleanWhatsapp = whatsappValidation.data;

    if (!cleanEmail) {
      const sanitizedDigits = cleanWhatsapp.replace(/\D/g, "");
      cleanEmail = `${sanitizedDigits || "customer"}@customer.sakilhub.com`;
    }
  }

  try {
    // 1. Fetch course or shop product details
    let itemTitle = "Masterclass / Digital Asset";
    let itemAmount = 1299;

    try {
      const shopProduct = await getShopProductBySlug(courseSlug);
      if (shopProduct) {
        itemTitle = shopProduct.title;
        itemAmount = shopProduct.price;
      } else {
        let course: CourseDetail = getCourseBySlug(courseSlug);
        try {
          const live = await getLiveCourseBySlug(courseSlug);
          if (live) course = live;
        } catch {}
        itemTitle = course.title;
        itemAmount = course.numericPrice || 1299;
      }
    } catch {
      let course: CourseDetail = getCourseBySlug(courseSlug);
      itemTitle = course?.title || itemTitle;
      itemAmount = course?.numericPrice || itemAmount;
    }

    const orderId = `SKL-${Date.now().toString().slice(-6)}`;
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderRecord: OrderDetails = {
      orderId,
      orderNumber,
      courseSlug,
      courseTitle: itemTitle,
      amount: itemAmount,
      paymentMethod,
      senderNumber: senderNumber,
      trxId: trxId,
      fullName: cleanFullName,
      email: cleanEmail,
      whatsappNumber: cleanWhatsapp,
      createdAt: new Date().toISOString(),
      status: "pending_verification",
    };

    // 2. Medusa Cart & Checkout Workflow (if backend is active)
    let medusaOrderId = orderId;
    try {
      // Create Cart in Medusa
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: "POST",
        headers: getMedusaHeaders(),
        body: JSON.stringify({
          email: orderRecord.email,
          metadata: {
            is_digital_course: true,
            course_slug: courseSlug,
            course_title: itemTitle,
            payment_method: paymentMethod,
            sender_number: orderRecord.senderNumber,
            trx_id: orderRecord.trxId,
            student_name: orderRecord.fullName,
            order_reference: orderNumber,
            status: "pending_verification",
          },
        }),
        cache: "no-store",
      });

      if (cartRes.ok) {
        const cartData = await cartRes.json().catch(() => null);
        const cartId = cartData?.cart?.id;

        if (cartId) {
          // Initialize payment collection / session
          try {
            await fetch(`${BACKEND_URL}/store/payment-collections`, {
              method: "POST",
              headers: getMedusaHeaders(),
              body: JSON.stringify({
                cart_id: cartId,
              }),
              cache: "no-store",
            });
          } catch {}

          // Complete cart into order
          const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cartId}/complete`, {
            method: "POST",
            headers: getMedusaHeaders(),
            body: JSON.stringify({}),
            cache: "no-store",
          });

          if (completeRes.ok) {
            const completeData = await completeRes.json().catch(() => null);
            if (completeData?.order?.id) {
              medusaOrderId = completeData.order.id;
              orderRecord.orderId = completeData.order.id;
            }
          }
        }
      }
    } catch (medusaErr) {
      console.warn("Medusa direct cart creation bypassed (offline/fallback mode):", medusaErr);
    }

    // 3. Persist Order to disk store for Admin telemetry
    await savePersistentOrder({
      id: orderRecord.orderId,
      orderNumber: orderRecord.orderNumber,
      studentName: orderRecord.fullName,
      email: orderRecord.email,
      courseTitle: orderRecord.courseTitle,
      courseSlug: orderRecord.courseSlug,
      amount: orderRecord.amount,
      paymentMethod: orderRecord.paymentMethod,
      senderNumber: orderRecord.senderNumber,
      trxId: orderRecord.trxId,
      status: "pending_verification",
      createdAt: orderRecord.createdAt,
    });

    // 4. Persist Pending Order to Secure Cookies
    const cookieStore = await cookies();
    const existingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    let pendingOrders: OrderDetails[] = [];
    if (existingOrdersRaw) {
      try {
        pendingOrders = JSON.parse(existingOrdersRaw);
      } catch {
        pendingOrders = [];
      }
    }

    // Add or update order
    pendingOrders = [orderRecord, ...pendingOrders.filter((o) => o.orderId !== orderRecord.orderId)];

    cookieStore.set("sakil_pending_orders", JSON.stringify(pendingOrders), getSessionCookieOptions(60 * 60 * 24 * 30));

    // Store active order for immediate success page rendering
    cookieStore.set(`sakil_order_${orderRecord.orderId}`, JSON.stringify(orderRecord), getSessionCookieOptions());

    // 5. Clear cart
    await clearCartAction();

    return {
      success: true,
      orderId: orderRecord.orderId,
      orderNumber: orderRecord.orderNumber,
      courseSlug: courseSlug,
    };
  } catch (err: any) {
    console.error("PROCESS MANUAL CHECKOUT ERROR:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while processing your checkout.",
    };
  }
}

/**
 * Server Action: Retrieves specific order details for receipt and confirmation page
 */
export async function getOrderDetailsAction(orderId: string): Promise<OrderDetails | null> {
  if (!orderId) return null;

  try {
    const cookieStore = await cookies();

    // 1. Check specific order cookie
    const singleOrderRaw = cookieStore.get(`sakil_order_${orderId}`)?.value;
    if (singleOrderRaw) {
      try {
        return JSON.parse(singleOrderRaw);
      } catch {}
    }

    // 2. Check pending orders list
    const pendingOrdersRaw = cookieStore.get("sakil_pending_orders")?.value;
    if (pendingOrdersRaw) {
      try {
        const orders: OrderDetails[] = JSON.parse(pendingOrdersRaw);
        const found = orders.find((o) => o.orderId === orderId || o.orderNumber === orderId);
        if (found) return found;
      } catch {}
    }

    // 3. Fallback simulated order receipt
    return {
      orderId,
      orderNumber: `ORD-${orderId.replace(/[^\d]/g, "") || "84920"}`,
      courseSlug: "premiere-pro-masterclass",
      courseTitle: "Premiere Pro Masterclass: Zero to Pro",
      amount: 1299,
      paymentMethod: "bKash",
      senderNumber: "017XXXXXXXX",
      trxId: "9J4K2L8M1",
      fullName: "Student",
      email: "student@sakilhub.com",
      createdAt: new Date().toISOString(),
      status: "pending_verification",
    };
  } catch (err) {
    console.error("GET ORDER DETAILS ERROR:", err);
    return null;
  }
}

/**
 * Legacy compatibility: completeEnrollmentAction forwards to processManualCheckout
 */
export async function completeEnrollmentAction(
  courseSlug: string,
  paymentDetails?: {
    method: string;
    senderNumber?: string;
    trxId?: string;
    fullName?: string;
    email?: string;
  }
): Promise<{ success: boolean; orderId?: string; courseSlug?: string; error?: string }> {
  return processManualCheckout({
    courseSlug,
    senderNumber: paymentDetails?.senderNumber || "01700000000",
    trxId: paymentDetails?.trxId || "TRX-MANUAL",
    paymentMethod: (paymentDetails?.method as any) || "bkash",
    fullName: paymentDetails?.fullName,
    email: paymentDetails?.email,
  });
}

/**
 * Retrieves the enrolled courses list (slugs) for the current student
 */
export async function getEnrolledCoursesAction(): Promise<string[]> {
  try {
    const { getEnrolledCoursesAction: getFullList } = await import("@/lib/actions/student");
    const fullList = await getFullList();
    return fullList.map((c) => c.slug);
  } catch {
    return [];
  }
}
