"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getPersistentBranding,
  updatePersistentBranding,
  DEFAULT_BRANDING,
} from "@/lib/data/branding";

export interface LMSSettingsPayload {
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  welcomeMessage?: string;
  announcement?: string;
  supportEmail: string;
  supportPhone: string;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: LMSSettingsPayload = {
  bkashNumber: "01754511619",
  nagadNumber: "01812345678",
  rocketNumber: "01912345678",
  welcomeMessage:
    "Welcome to Sakil Hub! Level up your video editing and filmmaking skills today.",
  announcement:
    "Welcome to Sakil Hub! Level up your video editing and filmmaking skills today.",
  supportEmail: "support@sakilhub.com",
  supportPhone: "+880 1712-345678",
};

/**
 * Server Action: Get LMS & Platform Settings
 */
export async function getLMSSettingsAction(): Promise<LMSSettingsPayload> {
  try {
    const branding = await getPersistentBranding();
    return {
      bkashNumber: branding.bkashNumber || DEFAULT_SETTINGS.bkashNumber,
      nagadNumber: branding.nagadNumber || DEFAULT_SETTINGS.nagadNumber,
      rocketNumber: (branding as any).rocketNumber || DEFAULT_SETTINGS.rocketNumber,
      welcomeMessage: branding.announcement || DEFAULT_SETTINGS.welcomeMessage,
      announcement: branding.announcement || DEFAULT_SETTINGS.announcement,
      supportEmail: branding.contactEmail || DEFAULT_SETTINGS.supportEmail,
      supportPhone: branding.contactPhone || DEFAULT_SETTINGS.supportPhone,
      updatedAt: branding.updatedAt,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Server Action: Update LMS & Platform Settings
 */
export async function updateLMSSettingsAction(
  payload: Partial<LMSSettingsPayload>
): Promise<{ success: boolean; error?: string; settings?: LMSSettingsPayload }> {
  try {
    const brandingUpdates: any = {};
    if (payload.bkashNumber !== undefined) brandingUpdates.bkashNumber = payload.bkashNumber;
    if (payload.nagadNumber !== undefined) brandingUpdates.nagadNumber = payload.nagadNumber;
    if (payload.rocketNumber !== undefined) brandingUpdates.rocketNumber = payload.rocketNumber;
    if (payload.announcement !== undefined || payload.welcomeMessage !== undefined) {
      brandingUpdates.announcement = payload.announcement || payload.welcomeMessage;
    }
    if (payload.supportEmail !== undefined) brandingUpdates.contactEmail = payload.supportEmail;
    if (payload.supportPhone !== undefined) brandingUpdates.contactPhone = payload.supportPhone;

    const updatedBranding = await updatePersistentBranding(brandingUpdates);

    const cookieStore = await cookies();
    cookieStore.set(
      "sakil_lms_settings",
      JSON.stringify({
        bkashNumber: updatedBranding.bkashNumber,
        nagadNumber: updatedBranding.nagadNumber,
        rocketNumber: (updatedBranding as any).rocketNumber || "01912345678",
        announcement: updatedBranding.announcement,
        welcomeMessage: updatedBranding.announcement,
        supportEmail: updatedBranding.contactEmail,
        supportPhone: updatedBranding.contactPhone,
      }),
      {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      }
    );

    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    revalidatePath("/", "layout");

    return {
      success: true,
      settings: {
        bkashNumber: updatedBranding.bkashNumber,
        nagadNumber: updatedBranding.nagadNumber,
        rocketNumber: (updatedBranding as any).rocketNumber || "01912345678",
        welcomeMessage: updatedBranding.announcement,
        announcement: updatedBranding.announcement,
        supportEmail: updatedBranding.contactEmail,
        supportPhone: updatedBranding.contactPhone,
        updatedAt: updatedBranding.updatedAt,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update settings" };
  }
}
