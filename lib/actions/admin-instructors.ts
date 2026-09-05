"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getPersistentInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  InstructorItem,
} from "@/lib/data/instructors";

/**
 * Validates admin authentication session
 */
async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("sakil_admin_token")?.value ||
    cookieStore.get("medusa_admin_token")?.value;
  return Boolean(token);
}

/**
 * Fetch all instructors for Admin table
 */
export async function getAdminInstructorsAction(): Promise<{
  success: boolean;
  instructors: InstructorItem[];
  error?: string;
}> {
  try {
    const list = await getPersistentInstructors();
    return { success: true, instructors: list };
  } catch (err: any) {
    return {
      success: false,
      instructors: [],
      error: err.message || "Failed to load instructors",
    };
  }
}

/**
 * Fetch single instructor by ID
 */
export async function getAdminInstructorByIdAction(id: string): Promise<{
  success: boolean;
  instructor: InstructorItem | null;
  error?: string;
}> {
  try {
    const item = await getInstructorById(id);
    if (!item) {
      return { success: false, instructor: null, error: "Instructor not found" };
    }
    return { success: true, instructor: item };
  } catch (err: any) {
    return {
      success: false,
      instructor: null,
      error: err.message || "Failed to load instructor",
    };
  }
}

/**
 * Create or save an instructor
 */
export async function saveAdminInstructorAction(
  payload: Omit<InstructorItem, "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  instructor?: InstructorItem;
  error?: string;
}> {
  const isAdmin = await verifyAdminAuth();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  if (!payload.name?.trim()) {
    return { success: false, error: "Instructor Name is required." };
  }

  try {
    let saved: InstructorItem;
    if (payload.id) {
      const existing = await getInstructorById(payload.id);
      if (existing) {
        const updated = await updateInstructor(payload.id, payload);
        if (!updated) throw new Error("Could not update instructor.");
        saved = updated;
      } else {
        saved = await createInstructor(payload);
      }
    } else {
      saved = await createInstructor(payload);
    }

    revalidatePath("/admin/instructors");
    revalidatePath("/instructors");
    revalidatePath("/courses");
    revalidatePath("/");

    return { success: true, instructor: saved };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to save instructor",
    };
  }
}

/**
 * Delete an instructor
 */
export async function deleteAdminInstructorAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const isAdmin = await verifyAdminAuth();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  if (!id) {
    return { success: false, error: "Instructor ID is required." };
  }

  try {
    const deleted = await deleteInstructor(id);
    if (!deleted) {
      return { success: false, error: "Instructor not found or already deleted." };
    }

    revalidatePath("/admin/instructors");
    revalidatePath("/instructors");
    revalidatePath("/courses");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete instructor",
    };
  }
}
