"use server";

import { cookies } from "next/headers";
import { getCourseBySlug, CourseDetail } from "@/lib/data/courses";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export interface CartItem {
  id: string;
  courseSlug: string;
  title: string;
  subtitle: string;
  instructor: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

export interface CartState {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
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
 * Creates or retrieves a Medusa Cart
 */
export async function getOrCreateCart(): Promise<string> {
  const cookieStore = await cookies();
  const existingCartId = cookieStore.get("medusa_cart_id")?.value;

  if (existingCartId) {
    return existingCartId;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: getMedusaHeaders(),
      body: JSON.stringify({}),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const cartId = data.cart?.id;
      if (cartId) {
        cookieStore.set("medusa_cart_id", cartId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        return cartId;
      }
    }
  } catch {
    // Continue to fallback
  }

  const fallbackId = `cart_${Date.now()}`;
  cookieStore.set("medusa_cart_id", fallbackId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return fallbackId;
}

/**
 * Adds a course to the cart
 */
export async function addToCartAction(
  courseSlug: string,
  quantity = 1
): Promise<{ success: boolean; cart?: CartState; error?: string }> {
  try {
    const cartId = await getOrCreateCart();
    const course: CourseDetail = getCourseBySlug(courseSlug);

    const newItem: CartItem = {
      id: `${cartId}_${course.slug}`,
      courseSlug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      instructor: course.instructor.name,
      thumbnail: course.image,
      price: course.numericPrice,
      originalPrice: course.numericOriginalPrice,
      quantity,
    };

    // Store in cookie cart items
    const cookieStore = await cookies();
    const existingItemsRaw = cookieStore.get("sakil_cart_items")?.value;
    let items: CartItem[] = [];

    if (existingItemsRaw) {
      try {
        items = JSON.parse(existingItemsRaw);
      } catch {
        items = [];
      }
    }

    // Check if item already in cart
    const existingIndex = items.findIndex((i) => i.courseSlug === course.slug);
    if (existingIndex > -1) {
      items[existingIndex].quantity = quantity;
    } else {
      items = [newItem]; // In a course platform, usually 1 course at checkout or replace
    }

    cookieStore.set("sakil_cart_items", JSON.stringify(items), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const subtotal = items.reduce((acc, i) => acc + i.originalPrice * i.quantity, 0);
    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const discount = subtotal - total;

    return {
      success: true,
      cart: {
        id: cartId,
        items,
        subtotal,
        discount,
        total,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: "Failed to add course to cart. Please try again.",
    };
  }
}

/**
 * Retrieves the current cart
 */
export async function getCartAction(): Promise<CartState> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("medusa_cart_id")?.value || `cart_${Date.now()}`;
  const existingItemsRaw = cookieStore.get("sakil_cart_items")?.value;

  let items: CartItem[] = [];

  if (existingItemsRaw) {
    try {
      items = JSON.parse(existingItemsRaw);
    } catch {
      items = [];
    }
  }

  // If cart is empty, default to premiere pro masterclass
  if (items.length === 0) {
    const defaultCourse = getCourseBySlug("premiere-pro-masterclass");
    items = [
      {
        id: `${cartId}_default`,
        courseSlug: defaultCourse.slug,
        title: defaultCourse.title,
        subtitle: defaultCourse.subtitle,
        instructor: defaultCourse.instructor.name,
        thumbnail: defaultCourse.image,
        price: defaultCourse.numericPrice,
        originalPrice: defaultCourse.numericOriginalPrice,
        quantity: 1,
      },
    ];
  }

  const subtotal = items.reduce((acc, i) => acc + i.originalPrice * i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discount = subtotal - total;

  return {
    id: cartId,
    items,
    subtotal,
    discount,
    total,
  };
}

/**
 * Clears the active cart
 */
export async function clearCartAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete("medusa_cart_id");
  cookieStore.delete("sakil_cart_items");
  return { success: true };
}
