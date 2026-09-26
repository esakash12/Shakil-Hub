"use server";

import { revalidatePath } from "next/cache";
import { getCustomerProfile } from "@/lib/actions/auth";
import {
  getPersistentNotes,
  savePersistentNote,
  deletePersistentNote,
  getPersistentQA,
  getAllPersistentQA,
  replyToPersistentQA,
  deletePersistentQA,
  postPersistentQA,
  QuestionItem,
} from "@/lib/data/interactions";
import { requireAdminSession } from "@/lib/actions/admin-auth";
import {
  sendQaReplyNotificationEmail,
  sendAdminContactNotificationEmail,
} from "@/lib/mail";

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

    // Non-blocking admin notification email about new classroom question
    sendAdminContactNotificationEmail({
      name: resolvedAuthor,
      email: customer?.email || "student@sakilhub.com",
      type: "Classroom Question",
      message: `Student asked a question in course "${courseSlug}" (Lesson: ${lessonId}):\n\n"${questionText.trim()}"`,
    }).catch((err) => {
      console.warn("Classroom question admin alert warning:", err);
    });

    revalidatePath(`/learn/${courseSlug}/${lessonId}`);
    return { success: true, questions: updated };
  } catch {
    return { success: false, questions: [] };
  }
}

/**
 * Server Action: Fetches all student questions across all courses for the Admin QA Hub
 */
export async function getAllAdminQuestionsAction(): Promise<QuestionItem[]> {
  const isAuth = await requireAdminSession();
  if (!isAuth) return [];
  try {
    return await getAllPersistentQA();
  } catch {
    return [];
  }
}

/**
 * Server Action: Replies to a student question from the Admin Panel
 */
export async function replyToQuestionAction(
  questionId: string,
  replyText: string,
  courseSlug?: string,
  lessonId?: string
): Promise<{ success: boolean; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  if (!questionId || !replyText?.trim()) {
    return { success: false, error: "Reply text is required." };
  }

  try {
    const updated = await replyToPersistentQA(questionId, replyText);
    if (!updated) {
      return { success: false, error: "Question not found." };
    }

    // Send Q&A Answered Email to Student if email is attached
    if (updated.email) {
      sendQaReplyNotificationEmail({
        to: updated.email,
        studentName: updated.author || "Student",
        question: updated.question,
        replyText: replyText.trim(),
        courseSlug: updated.courseSlug || courseSlug || "",
        lessonId: updated.lessonId || lessonId || "",
      }).catch((mailErr) => {
        console.warn("QA reply email dispatch warning:", mailErr);
      });
    }

    if (courseSlug && lessonId) {
      revalidatePath(`/learn/${courseSlug}/${lessonId}`);
    }
    revalidatePath("/admin/qa");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to post reply." };
  }
}

/**
 * Server Action: Deletes a student question from the Admin Panel
 */
export async function deleteQuestionAction(
  questionId: string,
  courseSlug?: string,
  lessonId?: string
): Promise<{ success: boolean; error?: string }> {
  const isAuth = await requireAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const success = await deletePersistentQA(questionId);
    if (courseSlug && lessonId) {
      revalidatePath(`/learn/${courseSlug}/${lessonId}`);
    }
    revalidatePath("/admin/qa");
    return { success };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete question." };
  }
}

