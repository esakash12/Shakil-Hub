"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getPersistentAboutCms,
  updatePersistentAboutCms,
  AboutCmsData,
} from "@/lib/data/about-cms";

async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("sakil_admin_token")?.value ||
    cookieStore.get("medusa_admin_token")?.value;
  return Boolean(token);
}

import { getPersistentInstructors } from "@/lib/data/instructors";

/**
 * Public action to get About CMS content
 */
export async function getAboutCmsAction(): Promise<AboutCmsData> {
  const data = await getPersistentAboutCms();
  try {
    const instructors = await getPersistentInstructors();
    if (instructors.length > 0) {
      const primary = instructors[0];
      if (!data.leadInstructorName || data.leadInstructorName === "Rashedul Hasan") {
        data.leadInstructorName = primary.name;
      }
      if (!data.leadInstructorAvatar || data.leadInstructorAvatar.includes("unsplash")) {
        data.leadInstructorAvatar = primary.avatar || "";
      }
    }
  } catch {}
  return data;
}

/**
 * Admin action to update About CMS content
 */
export async function updateAboutCmsAction(
  updates: Partial<AboutCmsData>
): Promise<{
  success: boolean;
  data?: AboutCmsData;
  error?: string;
}> {
  const isAdmin = await verifyAdminAuth();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const saved = await updatePersistentAboutCms(updates);
    revalidatePath("/about");
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, data: saved };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update About CMS." };
  }
}
