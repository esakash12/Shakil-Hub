import "server-only";
import fs from "fs/promises";
import path from "path";

export interface QuestionReply {
  author: string;
  time: string;
  text: string;
}

export interface QuestionItem {
  id: string;
  courseSlug: string;
  lessonId: string;
  author: string;
  email?: string;
  time: string;
  question: string;
  reply?: QuestionReply;
  createdAt: string;
}

const PROGRESS_FILE = path.join(process.cwd(), "lib", "data", "student-progress.json");
const NOTES_FILE = path.join(process.cwd(), "lib", "data", "student-notes.json");
const QA_FILE = path.join(process.cwd(), "lib", "data", "community-qa.json");
const WISHLIST_FILE = path.join(process.cwd(), "lib", "data", "student-wishlist.json");

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(data);
    if (parsed !== null && typeof parsed === "object") {
      return parsed;
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf8").catch(() => {});
    }
  }
  return defaultValue;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Failed to write to ${filePath}:`, err);
  }
}

// -------------------------------------------------------------
// 1. Student Progress Persistence (Per-Student Email)
// -------------------------------------------------------------

type ProgressStorage = Record<string, Record<string, string[]>>; // email -> courseSlug -> lessonId[]

export async function getPersistentProgress(
  email: string,
  courseSlug: string
): Promise<string[]> {
  if (!email || !courseSlug) return [];
  const normalizedEmail = email.toLowerCase().trim();
  const all = await readJsonFile<ProgressStorage>(PROGRESS_FILE, {});
  return all[normalizedEmail]?.[courseSlug] || [];
}

export async function getAllPersistentProgressForUser(
  email: string
): Promise<Record<string, string[]>> {
  if (!email) return {};
  const normalizedEmail = email.toLowerCase().trim();
  const all = await readJsonFile<ProgressStorage>(PROGRESS_FILE, {});
  return all[normalizedEmail] || {};
}

export async function markPersistentLessonCompleted(
  email: string,
  courseSlug: string,
  lessonId: string
): Promise<{ success: boolean; completedLessonIds: string[] }> {
  if (!email || !courseSlug || !lessonId) {
    return { success: false, completedLessonIds: [] };
  }
  const normalizedEmail = email.toLowerCase().trim();
  const all = await readJsonFile<ProgressStorage>(PROGRESS_FILE, {});

  if (!all[normalizedEmail]) all[normalizedEmail] = {};
  if (!all[normalizedEmail][courseSlug]) all[normalizedEmail][courseSlug] = [];

  const current = all[normalizedEmail][courseSlug];
  if (!current.includes(lessonId)) {
    all[normalizedEmail][courseSlug] = [...current, lessonId];
    await writeJsonFile(PROGRESS_FILE, all);
  }

  return { success: true, completedLessonIds: all[normalizedEmail][courseSlug] };
}

export async function togglePersistentLessonCompleted(
  email: string,
  courseSlug: string,
  lessonId: string
): Promise<{ success: boolean; isCompleted: boolean; completedLessonIds: string[] }> {
  if (!email || !courseSlug || !lessonId) {
    return { success: false, isCompleted: false, completedLessonIds: [] };
  }
  const normalizedEmail = email.toLowerCase().trim();
  const all = await readJsonFile<ProgressStorage>(PROGRESS_FILE, {});

  if (!all[normalizedEmail]) all[normalizedEmail] = {};
  if (!all[normalizedEmail][courseSlug]) all[normalizedEmail][courseSlug] = [];

  const current = all[normalizedEmail][courseSlug];
  let isCompleted = false;
  let updated: string[];

  if (current.includes(lessonId)) {
    updated = current.filter((id) => id !== lessonId);
    isCompleted = false;
  } else {
    updated = [...current, lessonId];
    isCompleted = true;
  }

  all[normalizedEmail][courseSlug] = updated;
  await writeJsonFile(PROGRESS_FILE, all);

  return { success: true, isCompleted, completedLessonIds: updated };
}

// -------------------------------------------------------------
// 2. Student Notes Persistence (Per-Student Email)
// -------------------------------------------------------------

type NotesStorage = Record<string, Record<string, string[]>>; // email -> "courseSlug:lessonId" -> notes[]

export async function getPersistentNotes(
  email: string,
  courseSlug: string,
  lessonId: string
): Promise<string[]> {
  if (!email || !courseSlug || !lessonId) return [];
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${courseSlug}:${lessonId}`;
  const all = await readJsonFile<NotesStorage>(NOTES_FILE, {});
  return all[normalizedEmail]?.[key] || [];
}

export async function savePersistentNote(
  email: string,
  courseSlug: string,
  lessonId: string,
  noteText: string
): Promise<string[]> {
  if (!email || !courseSlug || !lessonId || !noteText?.trim()) return [];
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${courseSlug}:${lessonId}`;
  const all = await readJsonFile<NotesStorage>(NOTES_FILE, {});

  if (!all[normalizedEmail]) all[normalizedEmail] = {};
  if (!all[normalizedEmail][key]) all[normalizedEmail][key] = [];

  const updated = [...all[normalizedEmail][key], noteText.trim()];
  all[normalizedEmail][key] = updated;
  await writeJsonFile(NOTES_FILE, all);
  return updated;
}

export async function deletePersistentNote(
  email: string,
  courseSlug: string,
  lessonId: string,
  noteIndex: number
): Promise<string[]> {
  if (!email || !courseSlug || !lessonId) return [];
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${courseSlug}:${lessonId}`;
  const all = await readJsonFile<NotesStorage>(NOTES_FILE, {});

  const current = all[normalizedEmail]?.[key] || [];
  const updated = current.filter((_, i) => i !== noteIndex);

  if (!all[normalizedEmail]) all[normalizedEmail] = {};
  all[normalizedEmail][key] = updated;
  await writeJsonFile(NOTES_FILE, all);
  return updated;
}

// -------------------------------------------------------------
// 3. Shared Community Q&A Persistence (Global across all students)
// -------------------------------------------------------------

export async function getPersistentQA(
  courseSlug: string,
  lessonId: string
): Promise<QuestionItem[]> {
  if (!courseSlug || !lessonId) return [];
  const all = await readJsonFile<QuestionItem[]>(QA_FILE, []);
  return all
    .filter((q) => q.courseSlug === courseSlug && q.lessonId === lessonId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function postPersistentQA(
  courseSlug: string,
  lessonId: string,
  questionText: string,
  authorName: string = "Student",
  authorEmail?: string
): Promise<QuestionItem[]> {
  if (!courseSlug || !lessonId || !questionText?.trim()) return [];
  const all = await readJsonFile<QuestionItem[]>(QA_FILE, []);

  const newEntry: QuestionItem = {
    id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    courseSlug,
    lessonId,
    author: authorName.trim() || "Student",
    email: authorEmail?.toLowerCase().trim(),
    time: "Just now",
    question: questionText.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated = [newEntry, ...all];
  await writeJsonFile(QA_FILE, updated);

  return updated
    .filter((q) => q.courseSlug === courseSlug && q.lessonId === lessonId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// -------------------------------------------------------------
// 4. Student Wishlist Persistence (Per-Student Email)
// -------------------------------------------------------------

type WishlistStorage = Record<string, string[]>; // email -> courseSlug[]

export async function getPersistentWishlist(email: string): Promise<string[]> {
  if (!email) return [];
  const normalizedEmail = email.toLowerCase().trim();
  const all = await readJsonFile<WishlistStorage>(WISHLIST_FILE, {});
  return all[normalizedEmail] || [];
}

export async function togglePersistentWishlist(
  email: string,
  courseSlug: string
): Promise<{ isWishlisted: boolean; slugs: string[] }> {
  if (!email || !courseSlug) return { isWishlisted: false, slugs: [] };
  const normalizedEmail = email.toLowerCase().trim();
  const all = await readJsonFile<WishlistStorage>(WISHLIST_FILE, {});

  const current = all[normalizedEmail] || [];
  let isWishlisted = false;
  let updated: string[];

  if (current.includes(courseSlug)) {
    updated = current.filter((s) => s !== courseSlug);
    isWishlisted = false;
  } else {
    updated = [...current, courseSlug];
    isWishlisted = true;
  }

  all[normalizedEmail] = updated;
  await writeJsonFile(WISHLIST_FILE, all);
  return { isWishlisted, slugs: updated };
}
