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

    // Also update cookie for immediate SSR / client hydration
    try {
      const cookieStore = await cookies();
      cookieStore.set("sakil_branding_settings", JSON.stringify(updated), {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });

      // Backward compatibility with legacy LMS settings cookie
      cookieStore.set(
        "sakil_lms_settings",
        JSON.stringify({
          bkashNumber: updated.bkashNumber,
          nagadNumber: updated.nagadNumber,
          announcement: updated.announcement,
          welcomeMessage: updated.announcement,
          supportEmail: updated.contactEmail,
          supportPhone: updated.contactPhone,
        }),
        {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 365,
        }
      );
    } catch {}

    // Optionally sync with backend Medusa if available
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const cookieStore = await cookies();
      const adminToken =
        cookieStore.get("sakil_admin_token")?.value ||
        cookieStore.get("medusa_admin_token")?.value ||
        "";

      await fetch(`${backendUrl}/admin/lms-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: adminToken ? `Bearer ${adminToken}` : "",
        },
        body: JSON.stringify(updated),
        cache: "no-store",
      }).catch(() => {});
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
