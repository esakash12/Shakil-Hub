"use server";

import { revalidatePath } from "next/cache";
import { getCustomerProfile } from "@/lib/actions/auth";
import {
  getPersistentNotes,
  savePersistentNote,
  deletePersistentNote,
  getPersistentQA,
  postPersistentQA,
  QuestionItem,
} from "@/lib/data/interactions";

export type { QuestionItem };

// -------------------------------------------------------------
// 1. Student Notes Server Actions (Persistent per student email)
// -------------------------------------------------------------

export async function getLessonNotesAction(
  courseSlug: string,
  lessonId: string
): Promise<string[]> {
  try {
    const customer = await getCustomerProfile().catch(() => null);
    if (!customer?.email) return [];
    return await getPersistentNotes(customer.email, courseSlug, lessonId);
  } catch {
    return [];
  }
}

export async function saveLessonNoteAction(
  courseSlug: string,
  lessonId: string,
  noteText: string
): Promise<{ success: boolean; notes: string[] }> {
  try {
    const customer = await getCustomerProfile().catch(() => null);
    if (!customer?.email) {
      return { success: false, notes: [] };
    }

    const updated = await savePersistentNote(
      customer.email,
      courseSlug,
      lessonId,
      noteText
    );

    revalidatePath(`/learn/${courseSlug}/${lessonId}`);
    return { success: true, notes: updated };
  } catch (err: any) {
    return { success: false, notes: [] };
  }
}

export async function deleteLessonNoteAction(
  courseSlug: string,
  lessonId: string,
  noteIndex: number
): Promise<{ success: boolean; notes: string[] }> {
  try {
    const customer = await getCustomerProfile().catch(() => null);
    if (!customer?.email) {
      return { success: false, notes: [] };
    }

    const updated = await deletePersistentNote(
      customer.email,
      courseSlug,
      lessonId,
      noteIndex
    );

    revalidatePath(`/learn/${courseSlug}/${lessonId}`);
    return { success: true, notes: updated };
  } catch {
    return { success: false, notes: [] };
  }
}

// -------------------------------------------------------------
// 2. Shared Community Q&A Server Actions (Global shared questions)
// -------------------------------------------------------------

export async function getLessonQuestionsAction(
  courseSlug: string,
  lessonId: string
): Promise<QuestionItem[]> {
  try {
    return await getPersistentQA(courseSlug, lessonId);
  } catch {
    return [];
  }
}

export async function postLessonQuestionAction(
  courseSlug: string,
  lessonId: string,
  questionText: string,
  authorName: string = "Enrolled Student"
): Promise<{ success: boolean; questions: QuestionItem[] }> {
  try {
    const customer = await getCustomerProfile().catch(() => null);
    const resolvedAuthor =
      customer?.first_name
        ? `${customer.first_name} ${customer.last_name || ""}`.trim()
        : authorName;

    const updated = await postPersistentQA(
      courseSlug,
      lessonId,
      questionText,
      resolvedAuthor,
      customer?.email
    );

    revalidatePath(`/learn/${courseSlug}/${lessonId}`);
    return { success: true, questions: updated };
  } catch {
    return { success: false, questions: [] };
  }
}
