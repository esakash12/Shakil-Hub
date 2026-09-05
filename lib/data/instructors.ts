import "server-only";
import fs from "fs/promises";
import path from "path";
import { InstructorItem } from "./instructor-types";

export * from "./instructor-types";

const INSTRUCTORS_FILE = path.join(process.cwd(), "lib", "data", "instructors.json");

/**
 * Reads all persistent instructors from disk
 */
export async function getPersistentInstructors(): Promise<InstructorItem[]> {
  try {
    const data = await fs.readFile(INSTRUCTORS_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.writeFile(INSTRUCTORS_FILE, JSON.stringify([], null, 2), "utf8");
    }
  }
  return [];
}

/**
 * Get single instructor by ID
 */
export async function getInstructorById(id: string): Promise<InstructorItem | null> {
  const instructors = await getPersistentInstructors();
  return instructors.find((i) => i.id === id || i.name.toLowerCase() === id.toLowerCase()) || null;
}

/**
 * Creates or saves a new instructor
 */
export async function createInstructor(
  payload: Omit<InstructorItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<InstructorItem> {
  const instructors = await getPersistentInstructors();
  const slugId =
    payload.id?.trim() ||
    payload.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-") ||
    `inst-${Date.now()}`;

  // Check if exists
  const existingIndex = instructors.findIndex((i) => i.id === slugId);
  const now = new Date().toISOString();

  const newInstructor: InstructorItem = {
    id: slugId,
    name: payload.name.trim(),
    role: payload.role?.trim() || "Course Instructor",
    avatar:
      payload.avatar?.trim() ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    experience: payload.experience?.trim() || "5+ Years",
    projects: payload.projects?.trim() || "100+",
    students: payload.students?.trim() || "1K+",
    bio: payload.bio?.trim() || "",
    socials: payload.socials || {},
    courseSlugs: payload.courseSlugs || [],
    courses: payload.courses || [],
    createdAt: existingIndex >= 0 ? instructors[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    instructors[existingIndex] = newInstructor;
  } else {
    instructors.push(newInstructor);
  }

  await fs.writeFile(INSTRUCTORS_FILE, JSON.stringify(instructors, null, 2), "utf8");
  return newInstructor;
}

/**
 * Updates an existing instructor
 */
export async function updateInstructor(
  id: string,
  updates: Partial<InstructorItem>
): Promise<InstructorItem | null> {
  const instructors = await getPersistentInstructors();
  const index = instructors.findIndex((i) => i.id === id);

  if (index === -1) {
    return null;
  }

  const updated: InstructorItem = {
    ...instructors[index],
    ...updates,
    id, // protect ID
    socials: {
      ...instructors[index].socials,
      ...(updates.socials || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  instructors[index] = updated;
  await fs.writeFile(INSTRUCTORS_FILE, JSON.stringify(instructors, null, 2), "utf8");
  return updated;
}

/**
 * Deletes an instructor by ID
 */
export async function deleteInstructor(id: string): Promise<boolean> {
  const instructors = await getPersistentInstructors();
  const filtered = instructors.filter((i) => i.id !== id);

  if (filtered.length === instructors.length) {
    return false;
  }

  await fs.writeFile(INSTRUCTORS_FILE, JSON.stringify(filtered, null, 2), "utf8");
  return true;
}
