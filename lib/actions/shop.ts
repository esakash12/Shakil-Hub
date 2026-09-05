"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getPersistentShopProducts,
  getShopProductBySlug,
  getShopProductById,
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
} from "@/lib/data/shop";
import { DigitalProduct, ShopProductPayload } from "@/lib/data/shop-types";

/**
 * Checks whether the current request is from an authenticated admin
 */
async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("sakil_admin_token")?.value ||
    cookieStore.get("medusa_admin_token")?.value;
  return Boolean(token && token.length > 5);
}

/**
 * Storefront: Fetch active digital products with optional category filter
 */
export async function getStorefrontShopProductsAction(category?: string): Promise<{
  success: boolean;
  products: DigitalProduct[];
  categories: string[];
}> {
  try {
    const all = await getPersistentShopProducts();
    const active = all.filter((p) => p.status === "active");

    const categoriesSet = new Set<string>();
    active.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
    });

    const categories = Array.from(categoriesSet);

    if (category && category !== "All") {
      const filtered = active.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
      return { success: true, products: filtered, categories };
    }

    return { success: true, products: active, categories };
  } catch (err: any) {
    console.error("Error fetching storefront shop products:", err);
    return { success: false, products: [], categories: [] };
  }
}

/**
 * Storefront: Fetch a single product by its slug
 */
export async function getStorefrontShopProductBySlugAction(slug: string): Promise<{
  success: boolean;
  product?: DigitalProduct | null;
  error?: string;
}> {
  try {
    const product = await getShopProductBySlug(slug);
    if (!product) {
      return { success: false, error: "Product not found" };
    }
    return { success: true, product };
  } catch (err: any) {
    console.error(`Error fetching product by slug ${slug}:`, err);
    return { success: false, error: "Failed to load product details" };
  }
}

/**
 * Admin: Fetch all digital products (including drafts)
 */
export async function getAdminShopProductsAction(): Promise<{
  success: boolean;
  products: DigitalProduct[];
  error?: string;
}> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return { success: false, products: [], error: "Unauthorized" };
  }

  try {
    const products = await getPersistentShopProducts();
    return { success: true, products };
  } catch (err: any) {
    console.error("Error fetching admin shop products:", err);
    return { success: false, products: [], error: "Failed to load products" };
  }
}

/**
 * Admin: Get a single digital product by ID
 */
export async function getAdminShopProductByIdAction(id: string): Promise<{
  success: boolean;
  product?: DigitalProduct | null;
  error?: string;
}> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const product = await getShopProductById(id);
    return { success: true, product };
  } catch (err: any) {
    console.error(`Error fetching admin product ${id}:`, err);
    return { success: false, error: "Failed to load product" };
  }
}

/**
 * Admin: Create or update a digital product
 */
export async function saveAdminShopProductAction(
  payload: ShopProductPayload,
  id?: string
): Promise<{
  success: boolean;
  product?: DigitalProduct | null;
  error?: string;
}> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    let saved: DigitalProduct | null = null;
    if (id) {
      saved = await updateShopProduct(id, payload);
    } else {
      saved = await createShopProduct(payload);
    }

    revalidatePath("/shop");
    revalidatePath("/admin/shop");
    if (saved) {
      revalidatePath(`/shop/${saved.slug}`);
    }

    return { success: true, product: saved };
  } catch (err: any) {
    console.error("Error saving digital product:", err);
    return { success: false, error: "Failed to save product" };
  }
}

/**
 * Admin: Delete a digital product
 */
export async function deleteAdminShopProductAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const success = await deleteShopProduct(id);
    if (!success) {
      return { success: false, error: "Product not found or already deleted" };
    }

    revalidatePath("/shop");
    revalidatePath("/admin/shop");

    return { success: true };
  } catch (err: any) {
    console.error(`Error deleting digital product ${id}:`, err);
    return { success: false, error: "Failed to delete product" };
  }
}
