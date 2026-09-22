"use server";

import { revalidatePath } from "next/cache";
import {
  PortfolioData,
  getPersistentPortfolio,
  savePersistentPortfolioItem,
  deletePersistentPortfolioItem,
  savePersistentPortfolioCategory,
  deletePersistentPortfolioCategory,
} from "@/lib/data/portfolio-store";
import { PortfolioCategoryMeta, PortfolioItem } from "@/lib/data/portfolio-types";
import { requireAdminSession } from "@/lib/actions/admin-auth";

/**
 * Server Action: Retrieve full portfolio data (categories & items)
 */
export async function getPortfolioAction(): Promise<PortfolioData> {
  try {
    return await getPersistentPortfolio();
  } catch (err: any) {
    console.error("GET PORTFOLIO ACTION ERROR:", err);
    return {
      categories: [],
      items: [],
    };
  }
}

/**
 * Server Action: Save (Create or Update) a Portfolio Item
 */
export async function savePortfolioItemAction(
  item: PortfolioItem
): Promise<{ success: boolean; item?: PortfolioItem; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    if (!item.id || !item.title.trim()) {
      return { success: false, error: "Project Title and ID are required." };
    }

    const saved = await savePersistentPortfolioItem(item);

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/portfolio");
    } catch {}

    return { success: true, item: saved };
  } catch (err: any) {
    console.error("SAVE PORTFOLIO ITEM ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to save portfolio project.",
    };
  }
}

/**
 * Server Action: Delete a Portfolio Item
 */
export async function deletePortfolioItemAction(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    if (!itemId) {
      return { success: false, error: "Project ID is required." };
    }

    await deletePersistentPortfolioItem(itemId);

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/portfolio");
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("DELETE PORTFOLIO ITEM ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to delete portfolio project.",
    };
  }
}

/**
 * Server Action: Save (Create or Update) a Portfolio Category
 */
export async function savePortfolioCategoryAction(
  category: PortfolioCategoryMeta
): Promise<{ success: boolean; category?: PortfolioCategoryMeta; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    if (!category.id || !category.label.trim()) {
      return { success: false, error: "Category Label and Slug are required." };
    }

    // Ensure slug is clean
    const cleanedCategory: PortfolioCategoryMeta = {
      ...category,
      id: category.id.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    };

    const saved = await savePersistentPortfolioCategory(cleanedCategory);

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/portfolio");
    } catch {}

    return { success: true, category: saved };
  } catch (err: any) {
    console.error("SAVE PORTFOLIO CATEGORY ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to save portfolio category.",
    };
  }
}

/**
 * Server Action: Delete a Portfolio Category
 */
export async function deletePortfolioCategoryAction(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    if (!categoryId || categoryId === "all") {
      return { success: false, error: "Cannot delete default 'all' category." };
    }

    await deletePersistentPortfolioCategory(categoryId);

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/portfolio");
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("DELETE PORTFOLIO CATEGORY ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to delete portfolio category.",
    };
  }
}
