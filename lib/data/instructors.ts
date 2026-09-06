import "server-only";
import fs from "fs/promises";
import path from "path";
import { InstructorItem } from "./instructor-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./instructor-types";

/**
 * Reads all persistent instructors from PostgreSQL via Prisma or storage fallback
 */
export async function getPersistentInstructors(): Promise<InstructorItem[]> {
  if (prisma && (await isPrismaReady())) {
    try {
      const dbInstructors = await prisma.instructor.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbInstructors && dbInstructors.length > 0) {
        return dbInstructors.map((i) => ({
          id: i.id,
          name: i.name,
          role: i.role,
          avatar: i.avatar || "",
          experience: i.experience || "",
          projects: i.projects || "",
          students: i.students || "",
          bio: i.bio || "",
          socials: (i.socials as any) || {},
          courseSlugs: i.courseSlugs || [],
          courses: (i.courses as any) || [],
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt ? i.updatedAt.toISOString() : undefined,
        }));
      }
    } catch (err) {
      console.warn("Prisma instructors query failed, falling back to file store:", err);
    }
  }

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

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.instructor.upsert({
        where: { id },
        update: {
          name: newInstructor.name,
          role: newInstructor.role,
          avatar: newInstructor.avatar || "",
          experience: newInstructor.experience || "",
          projects: newInstructor.projects || "",
          students: newInstructor.students || "",
          bio: newInstructor.bio || "",
          socials: (newInstructor.socials as any) || {},
          courseSlugs: newInstructor.courseSlugs || [],
          courses: (newInstructor.courses as any) || [],
        },
        create: {
          id,
          name: newInstructor.name,
          role: newInstructor.role,
          avatar: newInstructor.avatar || "",
          experience: newInstructor.experience || "",
          projects: newInstructor.projects || "",
          students: newInstructor.students || "",
          bio: newInstructor.bio || "",
          socials: (newInstructor.socials as any) || {},
          courseSlugs: newInstructor.courseSlugs || [],
          courses: (newInstructor.courses as any) || [],
        },
      });
    } catch (err) {
      console.warn("Prisma instructor upsert warning:", err);
    }
  }

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

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.instructor.update({
        where: { id: updated.id },
        data: {
          name: updated.name,
          role: updated.role,
          avatar: updated.avatar || "",
          experience: updated.experience || "",
          projects: updated.projects || "",
          students: updated.students || "",
          bio: updated.bio || "",
          socials: (updated.socials as any) || {},
          courseSlugs: updated.courseSlugs || [],
          courses: (updated.courses as any) || [],
        },
      });
    } catch (err) {
      console.warn("Prisma instructor update warning:", err);
    }
  }

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

  if (prisma && (await isPrismaReady())) {
    try {
      await prisma.instructor.deleteMany({
        where: {
          OR: [
            { id: target },
            { name: { equals: target, mode: "insensitive" } },
          ],
        },
      });
    } catch (err) {
      console.warn("Prisma instructor delete warning:", err);
    }
  }

  return true;
}
