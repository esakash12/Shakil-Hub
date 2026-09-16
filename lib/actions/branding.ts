"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  PlatformBrandingSettings,
  DEFAULT_BRANDING,
  getPersistentBranding,
  updatePersistentBranding,
} from "@/lib/data/branding";

/**
 * Server Action: Get Global Platform Branding & CMS Configuration
 */
export async function getPlatformBrandingAction(): Promise<PlatformBrandingSettings> {
  try {
    const persistent = await getPersistentBranding();
    return persistent;
  } catch (err) {
    console.error("GET BRANDING ACTION ERROR:", err);
    return DEFAULT_BRANDING;
  }
}

/**
 * Server Action: Update Global Platform Branding & CMS Configuration
 */
export async function updatePlatformBrandingAction(
  payload: Partial<PlatformBrandingSettings>
): Promise<{
  success: boolean;
  error?: string;
  settings?: PlatformBrandingSettings;
}> {
  try {
    const updated = await updatePersistentBranding(payload);

    // Clean up any legacy redundant cookies from client headers
    try {
      const cookieStore = await cookies();
      if (cookieStore.has("sakil_branding_settings")) cookieStore.delete("sakil_branding_settings");
      if (cookieStore.has("sakil_lms_settings")) cookieStore.delete("sakil_lms_settings");
    } catch {}



    // Revalidate all public and private pages so changes reflect live across the entire site
    revalidatePath("/", "layout");
    revalidatePath("/courses", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");

    return { success: true, settings: updated };
  } catch (err: any) {
    console.error("UPDATE BRANDING ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to update platform branding.",
    };
  }
}
