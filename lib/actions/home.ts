"use server";

import { revalidatePath } from "next/cache";
import { getPersistentHomeCms, updatePersistentHomeCms } from "@/lib/data/home-cms";
import { HomeCmsData } from "@/lib/data/home-cms-types";
import { requireAdminSession } from "@/lib/actions/admin-auth";

/**
 * Public action: Get current Home page CMS settings
 */
export async function getHomeCmsAction(): Promise<HomeCmsData> {
  return await getPersistentHomeCms();
}

/**
 * Admin action: Update Home page CMS settings
 */
export async function updateHomeCmsAction(
  updates: Partial<HomeCmsData>
): Promise<{ success: boolean; data?: HomeCmsData; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const updated = await updatePersistentHomeCms(updates);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("Failed to update Home CMS data:", err);
    return { success: false, error: "Failed to persist Home CMS settings." };
  }
}
