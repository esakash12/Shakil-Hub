"use server";

import { getPersistentInstructors, getInstructorById, InstructorItem } from "@/lib/data/instructors";

/**
 * Server Action: Fetches all active instructors for public storefront pages
 */
export async function getStorefrontInstructorsAction(): Promise<{
  success: boolean;
  instructors: InstructorItem[];
}> {
  try {
    const list = await getPersistentInstructors();
    return { success: true, instructors: list };
  } catch {
    return { success: false, instructors: [] };
  }
}

/**
 * Server Action: Fetches a single instructor by ID/slug for public course or bio pages
 */
export async function getStorefrontInstructorByIdAction(id: string): Promise<{
  success: boolean;
  instructor: InstructorItem | null;
}> {
  try {
    const item = await getInstructorById(id);
    return { success: true, instructor: item };
  } catch {
    return { success: false, instructor: null };
  }
}
