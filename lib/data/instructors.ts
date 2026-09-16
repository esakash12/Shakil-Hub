import "server-only";
import { InstructorItem } from "./instructor-types";
import { readDataFile, writeDataFile } from "./storage-helper";
import { prisma, isPrismaReady } from "../db/prisma";

export * from "./instructor-types";

/**
 * Reads all persistent instructors directly from PostgreSQL with JSON file fallback
 */
export async function getPersistentInstructors(): Promise<InstructorItem[]> {
  try {
    if (prisma && (await isPrismaReady())) {
      const dbInstructors = await prisma.instructor.findMany({
        orderBy: { createdAt: "desc" },
      });
      return (dbInstructors || []).map((i) => ({
        id: i.id,
        name: i.name,
        role: i.role || "Instructor",
        avatar: i.avatar || "",
        experience: i.experience || "8+ Years",
        projects: i.projects || "400+",
        students: i.students || "10K+",
        bio: i.bio || "",
        socials: (i.socials as any) || {},
        courseSlugs: i.courseSlugs || [],
        courses: (i.courses as any) || [],
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      }));
    }
  } catch (err: any) {
    console.warn("Prisma getPersistentInstructors error:", err.message || err);
  }

  try {
    const list = await readDataFile<InstructorItem[]>("instructors.json", []);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err: any) {
    console.error("Error reading persistent instructors fallback:", err);
  }
  return [];
}

/**
 * Get single instructor by ID from PostgreSQL
 */
export async function getInstructorById(id: string): Promise<InstructorItem | null> {
  if (!id) return null;
  const target = id.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      const i = await prisma.instructor.findFirst({
        where: {
          OR: [
            { id: target },
            { id: { equals: target, mode: "insensitive" } },
            { name: { equals: id, mode: "insensitive" } },
          ],
        },
      });
      if (i) {
        return {
          id: i.id,
          name: i.name,
          role: i.role || "Instructor",
          avatar: i.avatar || "",
          experience: i.experience || "8+ Years",
          projects: i.projects || "400+",
          students: i.students || "10K+",
          bio: i.bio || "",
          socials: (i.socials as any) || {},
          courseSlugs: i.courseSlugs || [],
          courses: (i.courses as any) || [],
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn("Prisma getInstructorById error:", err.message || err);
  }

  const instructors = await getPersistentInstructors();
  return instructors.find((i) => (i.id || "").toLowerCase().trim() === target || (i.name || "").toLowerCase().trim() === target) || null;
}

/**
 * Creates or saves a new instructor in PostgreSQL
 */
export async function createInstructor(
  payload: Omit<InstructorItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<InstructorItem> {
  const id =
    payload.id ||
    payload.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

  const now = new Date().toISOString();

  const newInstructor: InstructorItem = {
    ...payload,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.instructor.upsert({
        where: { id },
        update: {
          name: payload.name,
          role: payload.role || "Instructor",
          avatar: payload.avatar || "",
          experience: payload.experience || "8+ Years",
          projects: payload.projects || "400+",
          students: payload.students || "10K+",
          bio: payload.bio || "",
          socials: (payload.socials as any) || {},
          courseSlugs: payload.courseSlugs || [],
          courses: (payload.courses as any) || [],
        },
        create: {
          id,
          name: payload.name,
          role: payload.role || "Instructor",
          avatar: payload.avatar || "",
          experience: payload.experience || "8+ Years",
          projects: payload.projects || "400+",
          students: payload.students || "10K+",
          bio: payload.bio || "",
          socials: (payload.socials as any) || {},
          courseSlugs: payload.courseSlugs || [],
          courses: (payload.courses as any) || [],
        },
      });
    }
  } catch (err: any) {
    console.warn("Prisma createInstructor error:", err.message || err);
  }

  // Backup to instructors.json
  try {
    const instructors = await readDataFile<InstructorItem[]>("instructors.json", []);
    const existingIndex = instructors.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      instructors[existingIndex] = newInstructor;
    } else {
      instructors.push(newInstructor);
    }
    await writeDataFile("instructors.json", instructors);
  } catch {}

  return newInstructor;
}

/**
 * Updates an existing instructor in PostgreSQL
 */
export async function updateInstructor(
  id: string,
  updates: Partial<InstructorItem>
): Promise<InstructorItem | null> {
  try {
    if (prisma && (await isPrismaReady())) {
      const existing = await prisma.instructor.findFirst({
        where: { OR: [{ id }, { name: id }] },
      });
      if (existing) {
        const updated = await prisma.instructor.update({
          where: { id: existing.id },
          data: {
            name: updates.name ?? existing.name,
            role: updates.role ?? existing.role,
            avatar: updates.avatar ?? existing.avatar,
            experience: updates.experience ?? existing.experience,
            projects: updates.projects ?? existing.projects,
            students: updates.students ?? existing.students,
            bio: updates.bio ?? existing.bio,
            socials: updates.socials ? (updates.socials as any) : existing.socials,
            courseSlugs: updates.courseSlugs ?? existing.courseSlugs,
            courses: updates.courses ? (updates.courses as any) : existing.courses,
          },
        });
        const mappedUpdated: InstructorItem = {
          id: updated.id,
          name: updated.name,
          role: updated.role || "Instructor",
          avatar: updated.avatar || "",
          experience: updated.experience || "8+ Years",
          projects: updated.projects || "400+",
          students: updated.students || "10K+",
          bio: updated.bio || "",
          socials: (updated.socials as any) || {},
          courseSlugs: updated.courseSlugs || [],
          courses: (updated.courses as any) || [],
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };

        // Always sync instructors.json backup store
        try {
          const instructors = await readDataFile<InstructorItem[]>("instructors.json", []);
          const target = (id || "").toLowerCase().trim();
          const idx = instructors.findIndex((i) => (i.id || "").toLowerCase().trim() === target || (i.name || "").toLowerCase().trim() === target);
          if (idx >= 0) {
            instructors[idx] = { ...instructors[idx], ...mappedUpdated };
          } else {
            instructors.push(mappedUpdated);
          }
          await writeDataFile("instructors.json", instructors);
        } catch {}

        return mappedUpdated;
      }
    }
  } catch (err: any) {
    console.warn("Prisma updateInstructor error:", err.message || err);
  }

  // Fallback to instructors.json
  const instructors = await readDataFile<InstructorItem[]>("instructors.json", []);
  const target = (id || "").toLowerCase().trim();
  const index = instructors.findIndex((i) => (i.id || "").toLowerCase().trim() === target || (i.name || "").toLowerCase().trim() === target);
  if (index === -1) return null;

  const updated: InstructorItem = {
    ...instructors[index],
    ...updates,
    id: instructors[index].id,
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
 * Deletes an instructor by ID in PostgreSQL
 */
export async function deleteInstructor(id: string): Promise<boolean> {
  if (!id) return false;
  const target = id.toLowerCase().trim();

  try {
    if (prisma && (await isPrismaReady())) {
      await prisma.instructor.deleteMany({
        where: {
          OR: [{ id: target }, { name: { equals: id, mode: "insensitive" } }],
        },
      });
    }
  } catch (err: any) {
    console.warn("Prisma deleteInstructor error:", err.message || err);
  }

  try {
    const instructors = await readDataFile<InstructorItem[]>("instructors.json", []);
    const filtered = instructors.filter((i) => {
      const iId = (i.id || "").toLowerCase().trim();
      const iName = (i.name || "").toLowerCase().trim();
      return iId !== target && iName !== target;
    });
    await writeDataFile("instructors.json", filtered);
  } catch {}

  return true;
}
