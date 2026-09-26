"use server";

import { sendAdminContactNotificationEmail } from "@/lib/mail";

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  date?: string;
  time?: string;
  type?: string;
}

/**
 * Server Action: Submits a contact inquiry or VIP consultation booking
 * and dispatches an immediate email alert to ADMIN_NOTIFICATION_EMAIL
 */
export async function submitContactAction(
  data: ContactSubmission
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanName = data.name?.trim() || "Website Visitor";
    const cleanEmail = data.email?.trim() || "visitor@sakilhub.com";

    const mailRes = await sendAdminContactNotificationEmail({
      name: cleanName,
      email: cleanEmail,
      phone: data.phone?.trim(),
      message: data.message?.trim(),
      date: data.date?.trim(),
      time: data.time?.trim(),
      type: data.type || "VIP Strategy Consultation",
    });

    return {
      success: mailRes.success,
      message: mailRes.success
        ? "Inquiry sent successfully! Admin has been notified via email."
        : mailRes.error,
    };
  } catch (err: any) {
    console.error("CONTACT ACTION ERROR:", err);
    return { success: false, error: "Failed to process inquiry." };
  }
}
