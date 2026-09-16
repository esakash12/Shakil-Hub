"use server";

import { cookies } from "next/headers";
import { getCourseBySlug, CourseDetail } from "@/lib/data/courses";
import { getSessionCookieOptions } from "@/lib/security/cookies";

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

/**
 * Creates or retrieves the active session Cart ID
 */
export async function getOrCreateCart(): Promise<string> {
  const cookieStore = await cookies();
  const existingCartId =
    cookieStore.get("sakil_cart_id")?.value ||
    cookieStore.get("medusa_cart_id")?.value;

  if (existingCartId) {
    return existingCartId;
  }

  const newCartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  cookieStore.set("sakil_cart_id", newCartId, getSessionCookieOptions());
  return newCartId;
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
    let course: CourseDetail = getCourseBySlug(courseSlug);
    try {
      const { getLiveCourseBySlug } = await import("@/lib/data/courses-db");
      const live = await getLiveCourseBySlug(courseSlug);
      if (live) course = live;
    } catch {}

    const newItem: CartItem = {
      id: `${cartId}_${course.slug}`,
      courseSlug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      instructor: course.instructor?.name || "Instructor",
      thumbnail: course.thumbnail || course.image || "",
      price: course.numericPrice || 1299,
      originalPrice: course.numericOriginalPrice || 2858,
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
      items = [newItem]; // In a course platform, 1 course at checkout or replace
    }

    cookieStore.set("sakil_cart_items", JSON.stringify(items), getSessionCookieOptions());

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
  } catch {
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
  const cartId =
    cookieStore.get("sakil_cart_id")?.value ||
    cookieStore.get("medusa_cart_id")?.value ||
    `cart_${Date.now()}`;
  const existingItemsRaw = cookieStore.get("sakil_cart_items")?.value;

  let items: CartItem[] = [];

  if (existingItemsRaw) {
    try {
      items = JSON.parse(existingItemsRaw);
    } catch {
      items = [];
    }
  }

  if (items.length === 0) {
    return {
      id: cartId,
      items: [],
      subtotal: 0,
      total: 0,
      discount: 0,
    };
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
  cookieStore.delete("sakil_cart_id");
  cookieStore.delete("medusa_cart_id");
  cookieStore.delete("sakil_cart_items");
  return { success: true };
}
