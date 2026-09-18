"use server";

import { revalidatePath } from "next/cache";
import {
  AgencyCmsData,
  DEFAULT_AGENCY_CMS,
  getPersistentAgencyCms,
  updatePersistentAgencyCms,
} from "@/lib/data/agency-cms";

/**
 * Server Action: Get Live Agency Landing Page CMS Data
 */
export async function getAgencyCmsAction(): Promise<AgencyCmsData> {
  try {
    return await getPersistentAgencyCms();
  } catch (err: any) {
    console.error("GET AGENCY CMS ACTION ERROR:", err);
    return DEFAULT_AGENCY_CMS;
  }
}

/**
 * Server Action: Update Live Agency Landing Page CMS Data
 */
export async function updateAgencyCmsAction(
  payload: Partial<AgencyCmsData>
): Promise<{ success: boolean; data?: AgencyCmsData; error?: string }> {
  try {
    const updated = await updatePersistentAgencyCms(payload);

    try {
      revalidatePath("/", "layout");
      revalidatePath("/admin/settings");
    } catch {}

    return { success: true, data: updated };
  } catch (err: any) {
    console.error("UPDATE AGENCY CMS ACTION ERROR:", err);
    return {
      success: false,
      error: err.message || "Failed to update landing page CMS.",
    };
  }
}
