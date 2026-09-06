import "server-only";
import fs from "fs/promises";
import path from "path";
import { InstructorItem } from "./instructor-types";

import { readDataFile, writeDataFile } from "./storage-helper";

export * from "./instructor-types";

/**
 * Reads all persistent instructors from disk (with 4-layer storage hierarchy)
 */
export async function getPersistentInstructors(): Promise<InstructorItem[]> {
  try {
    const list = await readDataFile<InstructorItem[]>("instructors.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent instructors:", err);
  }
  return [];
}

/**
 * Get single instructor by ID
 */
export async function getInstructorById(id: string): Promise<InstructorItem | null> {
  const instructors = await getPersistentInstructors();
  const target = (id || "").toLowerCase().trim();
  return instructors.find((i) => (i.id || "").toLowerCase().trim() === target || (i.name || "").toLowerCase().trim() === target) || null;
}

/**
 * Creates or saves a new instructor
 */
export async function createInstructor(
  payload: Omit<InstructorItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<InstructorItem> {
  const instructors = await getPersistentInstructors();
  const id =
    payload.id ||
    payload.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

  const existingIndex = instructors.findIndex((i) => i.id === id);
  const now = new Date().toISOString();

  const newInstructor: InstructorItem = {
    ...payload,
    id,
    createdAt: existingIndex >= 0 ? instructors[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    instructors[existingIndex] = newInstructor;
  } else {
    instructors.push(newInstructor);
  }

  await writeDataFile("instructors.json", instructors);
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
  const target = (id || "").toLowerCase().trim();
  const index = instructors.findIndex((i) => (i.id || "").toLowerCase().trim() === target || (i.name || "").toLowerCase().trim() === target);

  if (index === -1) {
    return null;
  }

  const updated: InstructorItem = {
    ...instructors[index],
    ...updates,
    id: instructors[index].id, // protect ID
    socials: {
      ...instructors[index].socials,
      ...(updates.socials || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  instructors[index] = updated;
  await writeDataFile("instructors.json", instructors);
  return updated;
}

/**
 * Deletes an instructor by ID
 */
export async function deleteInstructor(id: string): Promise<boolean> {
  if (!id) return false;
  const target = id.toLowerCase().trim();
  const instructors = await getPersistentInstructors();
  const filtered = instructors.filter((i) => {
    const iId = (i.id || "").toLowerCase().trim();
    const iName = (i.name || "").toLowerCase().trim();
    return iId !== target && iName !== target;
  });

  if (filtered.length === instructors.length) {
    return false;
  }

  await writeDataFile("instructors.json", filtered);
  return true;
}
