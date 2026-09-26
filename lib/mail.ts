import nodemailer, { type Transporter } from "nodemailer";

// Lazy-initialized SMTP Transporter
let transporter: Transporter | null = null;

export function getMailTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER || "esakash12@gmail.com";
    const pass = process.env.SMTP_PASS || "";

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface MailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Universal safe mail sender with non-blocking error handling
 */
export async function sendMail(options: SendMailOptions): Promise<MailResult> {
  const from = process.env.SMTP_FROM || `Sakil Hub <${process.env.SMTP_USER || "esakash12@gmail.com"}>`;

  try {
    const client = getMailTransporter();
    const info = await client.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
      replyTo: options.replyTo,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("UNIVERSAL SMTP ERROR:", err?.message || err);
    // Non-blocking: always gracefully return error instead of throwing and crashing requests
    return {
      success: false,
      error: err?.message || "Failed to send email notification",
    };
  }
}

/**
 * Branded Responsive Email HTML Shell for Sakil Hub
 */
export function createEmailLayout(props: {
  title: string;
  preheader: string;
  headline: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const { title, preheader, headline, contentHtml, ctaText, ctaUrl, footerNote } = props;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050811;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .card {
      background: linear-gradient(180deg, #0b1120 0%, #060a14 100%);
      border: 1px solid rgba(0, 210, 255, 0.2);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 32px 32px 20px 32px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      background: radial-gradient(circle at 50% 0%, rgba(0, 210, 255, 0.15) 0%, transparent 70%);
    }
    .logo-badge {
      display: inline-block;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-decoration: none;
    }
    .logo-accent {
      color: #00d2ff;
    }
    .tagline {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 4px;
    }
    .body {
      padding: 32px;
      line-height: 1.6;
      font-size: 15px;
      color: #cbd5e1;
    }
    .headline {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }
    .button-wrap {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #00d2ff 0%, #0077ff 100%);
      color: #ffffff !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 210, 255, 0.35);
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #00d2ff;
      background: rgba(0, 210, 255, 0.08);
      border: 1px dashed rgba(0, 210, 255, 0.4);
      border-radius: 12px;
      padding: 16px 24px;
      text-align: center;
      margin: 24px 0;
    }
    .info-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 13px;
    }
    .info-label {
      color: #94a3b8;
    }
    .info-val {
      color: #f1f5f9;
      font-weight: 600;
      text-align: right;
    }
    .footer {
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #00d2ff;
      text-decoration: none;
    }
    .preheader {
      display: none !important;
      font-size: 1px;
      color: #050811;
      line-height: 1px;
      max-height: 0px;
      max-width: 0px;
      opacity: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="card">
      <div class="header">
        <a href="${baseUrl}" class="logo-badge">Sakil<span class="logo-accent">Hub</span></a>
        <div class="tagline">Video Editing Academy &amp; Production Studio</div>
      </div>
      <div class="body">
        <h1 class="headline">${headline}</h1>
        ${contentHtml}
        ${
          ctaText && ctaUrl
            ? `<div class="button-wrap">
                <a href="${ctaUrl}" class="button" target="_blank">${ctaText} &rarr;</a>
              </div>`
            : ""
        }
        ${footerNote ? `<p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">${footerNote}</p>` : ""}
      </div>
      <div class="footer">
        <p>&copy; ${year} Sakil Hub. All rights reserved.<br>
        Dhaka, Bangladesh &bull; <a href="${baseUrl}">sakilhub.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ----------------------------------------------------------------------
// Specific Trigger Implementations
// ----------------------------------------------------------------------

/**
 * 1. User Registration: Welcome Email
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const html = createEmailLayout({
    title: "Welcome to Sakil Hub!",
    preheader: "Welcome aboard! Your video editing journey starts right now.",
    headline: `Welcome to the Academy, ${name || "Creator"}! 🎬`,
    contentHtml: `
      <p>Congratulations on joining <strong>Sakil Hub</strong>, the premier learning ecosystem for video creators, colorists, and motion designers.</p>
      <p>Your student account gives you instant access to:</p>
      <ul style="padding-left: 20px; color: #94a3b8;">
        <li>High-bitrate Cloudflare R2 lesson streaming with timestamp resume</li>
        <li>Curated digital assets, project files, LUTs, and preset packs</li>
        <li>Direct classroom Q&amp;A with MH Sakil and our lead editors</li>
        <li>Verified course completion certificates with instant public validation</li>
      </ul>
      <p>Explore our masterclasses or check your student dashboard anytime.</p>
    `,
    ctaText: "Go to Student Dashboard",
    ctaUrl: `${baseUrl}/dashboard`,
  });

  return sendMail({
    to,
    subject: "Welcome to Sakil Hub — Let's Elevate Your Video Craft! 🚀",
    html,
  });
}

/**
 * 2. Forgot Password OTP & Reset Link Email
 */
export async function sendPasswordResetOtpEmail(
  to: string,
  name: string,
  otp: string,
  resetToken: string
): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const resetLink = `${baseUrl}/reset-password?email=${encodeURIComponent(to)}&token=${encodeURIComponent(resetToken)}`;

  const html = createEmailLayout({
    title: "Reset Your Password - Sakil Hub",
    preheader: `Your Sakil Hub verification code is ${otp}. Valid for 15 minutes.`,
    headline: "Password Reset Request 🔐",
    contentHtml: `
      <p>Hello ${name || "there"},</p>
      <p>We received a request to reset the password for your Sakil Hub account (<code>${to}</code>). Use the 6-digit verification code below to complete your reset:</p>
      <div class="otp-code">${otp}</div>
      <p style="text-align: center; color: #94a3b8; font-size: 13px;">This code will expire in <strong>15 minutes</strong>.</p>
      <p>Or click the button below to reset your password directly:</p>
    `,
    ctaText: "Reset Password Instantly",
    ctaUrl: resetLink,
    footerNote: "If you did not request this password reset, please ignore this email or reach out to our security desk immediately.",
  });

  return sendMail({
    to,
    subject: `[Sakil Hub] ${otp} is your verification code for password reset`,
    html,
  });
}

/**
 * 3. Password Changed Confirmation Alert Email
 */
export async function sendPasswordChangedAlertEmail(to: string, name: string): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const html = createEmailLayout({
    title: "Password Changed Successfully - Sakil Hub",
    preheader: "Your account password was recently changed.",
    headline: "Password Changed Successfully 🛡️",
    contentHtml: `
      <p>Hello ${name || "there"},</p>
      <p>The password for your Sakil Hub student account (<code>${to}</code>) was successfully updated on <strong>${new Date().toUTCString()}</strong>.</p>
      <p>If you made this change, no further action is required and you may log in normally with your new credentials.</p>
      <p style="color: #ef4444; font-size: 13px;">If you did <strong>NOT</strong> initiate this change, your account may be compromised. Please contact support immediately.</p>
    `,
    ctaText: "Sign In to Your Account",
    ctaUrl: `${baseUrl}/login`,
  });

  return sendMail({
    to,
    subject: "[Security Alert] Your Sakil Hub password has been updated",
    html,
  });
}

/**
 * 4. Order Received (Pending Verification)
 */
export async function sendOrderReceivedEmail(data: {
  to: string;
  name: string;
  orderNumber: string;
  courseTitle: string;
  amount: number;
  paymentMethod: string;
  trxId: string;
}): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const html = createEmailLayout({
    title: "Order Received - Pending Verification",
    preheader: `We have received your order #${data.orderNumber} for ${data.courseTitle}.`,
    headline: "Order Received — Pending Verification ⏳",
    contentHtml: `
      <p>Hello ${data.name || "Student"},</p>
      <p>Thank you for your order! We have successfully recorded your payment transfer details. Our accounts team will verify your transaction shortly.</p>
      <div class="info-box">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Order Number:</td>
            <td style="padding: 6px 0; color: #00d2ff; font-weight: 700; text-align: right; font-family: monospace;">#${data.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Item / Course:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${data.courseTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Amount Paid:</td>
            <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">৳${data.amount.toLocaleString()} BDT</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Payment Method:</td>
            <td style="padding: 6px 0; color: #ffffff; text-align: right; text-transform: uppercase;">${data.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Transaction ID:</td>
            <td style="padding: 6px 0; color: #ffffff; font-family: monospace; text-align: right;">${data.trxId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Status:</td>
            <td style="padding: 6px 0; color: #f59e0b; font-weight: 600; text-align: right;">Verification in Progress</td>
          </tr>
        </table>
      </div>
      <p>Verification typically takes <strong>5 to 30 minutes</strong> during working hours. Once verified, your course and downloads will unlock automatically!</p>
    `,
    ctaText: "Check Order Status",
    ctaUrl: `${baseUrl}/dashboard/pending`,
  });

  return sendMail({
    to: data.to,
    subject: `Order #${data.orderNumber} Received — Sakil Hub [Pending Verification]`,
    html,
  });
}

/**
 * 5. Order Approved — Access Unlocked!
 */
export async function sendOrderApprovedEmail(data: {
  to: string;
  name: string;
  orderNumber: string;
  itemTitle: string;
  itemType: "course" | "product";
  slug: string;
}): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const actionUrl =
    data.itemType === "course"
      ? `${baseUrl}/courses/${data.slug}`
      : `${baseUrl}/dashboard/downloads`;

  const html = createEmailLayout({
    title: "Order Approved — Access Unlocked!",
    preheader: `Good news! Your order #${data.orderNumber} has been verified and unlocked.`,
    headline: "Payment Verified — Access Unlocked! 🎉",
    contentHtml: `
      <p>Hello ${data.name || "Student"},</p>
      <p>Great news! Your payment for <strong>${data.itemTitle}</strong> (Order <code>#${data.orderNumber}</code>) has been verified and approved by the administration.</p>
      <p style="color: #10b981; font-weight: 600;">✓ Full access has been granted to your student account.</p>
      <div class="info-box">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Enrolled Item:</p>
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #ffffff;">${data.itemTitle}</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #00d2ff;">
          ${data.itemType === "course" ? "Masterclass Stream Ready • 1080p HD" : "Digital Asset • Instant Download"}
        </p>
      </div>
      <p>You can start watching lessons or accessing your digital downloads immediately.</p>
    `,
    ctaText: data.itemType === "course" ? "Go to Classroom" : "View Downloads",
    ctaUrl: actionUrl,
  });

  return sendMail({
    to: data.to,
    subject: `Payment Approved! Access Unlocked for ${data.itemTitle} 🚀`,
    html,
  });
}

/**
 * 6. Certificate Issued Notification Email
 */
export async function sendCertificateIssuedEmail(data: {
  to: string;
  name: string;
  courseTitle: string;
  certificateCode: string;
}): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const verifyUrl = `${baseUrl}/verify/${encodeURIComponent(data.certificateCode)}`;

  const html = createEmailLayout({
    title: "Congratulations on Your Certificate! - Sakil Hub",
    preheader: `Congratulations ${data.name}! You have earned your certificate in ${data.courseTitle}.`,
    headline: "Masterclass Completed — Certificate Issued! 🏆",
    contentHtml: `
      <p>Dear ${data.name},</p>
      <p>A huge congratulations on achieving <strong>100% completion</strong> in <strong>${data.courseTitle}</strong>!</p>
      <p>Your official Sakil Hub Certificate of Completion has been generated and permanently registered in our global verification registry.</p>
      <div class="info-box" style="text-align: center;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8;">Verified Certificate Number</div>
        <div style="font-family: monospace; font-size: 20px; font-weight: 800; color: #00d2ff; margin-top: 6px;">
          ${data.certificateCode}
        </div>
      </div>
      <p>You can download your PDF certificate from your student dashboard, add it to your LinkedIn profile, or share the public verification link with clients and employers.</p>
    `,
    ctaText: "View & Verify Certificate",
    ctaUrl: verifyUrl,
  });

  return sendMail({
    to: data.to,
    subject: `Congratulations! Your Certificate for ${data.courseTitle} is Ready 🎓`,
    html,
  });
}

/**
 * 7. Admin Alert: Contact Form / Agency Strategy Consultation Submitted
 */
export async function sendAdminContactNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  date?: string;
  time?: string;
  type?: string;
}): Promise<MailResult> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "esakash12@gmail.com";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";

  const html = createEmailLayout({
    title: "New Inbound Inquiry - Sakil Hub",
    preheader: `New ${data.type || "Inquiry"} from ${data.name} (${data.email})`,
    headline: `New ${data.type || "VIP Consultation"} Booking 📩`,
    contentHtml: `
      <p>An inquiry / strategy consultation was submitted through the Sakil Hub portal.</p>
      <div class="info-box">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Name:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Email:</td>
            <td style="padding: 6px 0; color: #00d2ff; text-align: right;"><a href="mailto:${data.email}" style="color: #00d2ff;">${data.email}</a></td>
          </tr>
          ${
            data.phone
              ? `<tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Phone / WhatsApp:</td>
                  <td style="padding: 6px 0; color: #ffffff; text-align: right;">${data.phone}</td>
                </tr>`
              : ""
          }
          ${
            data.date && data.time
              ? `<tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Requested Slot:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">${data.date} at ${data.time}</td>
                </tr>`
              : ""
          }
        </table>
      </div>
      ${
        data.message
          ? `<div style="background: rgba(255,255,255,0.02); border-left: 3px solid #00d2ff; padding: 12px; margin-top: 16px; font-size: 13px; color: #e2e8f0;">
              <strong>Client Note:</strong><br>${data.message}
            </div>`
          : ""
      }
    `,
    ctaText: "Open Admin Dashboard",
    ctaUrl: `${baseUrl}/admin`,
  });

  return sendMail({
    to: adminEmail,
    subject: `[Admin Alert] New ${data.type || "Consultation"} from ${data.name}`,
    html,
    replyTo: data.email,
  });
}

/**
 * 8. Student Alert: Classroom Q&A Answered by Instructor
 */
export async function sendQaReplyNotificationEmail(data: {
  to: string;
  studentName: string;
  question: string;
  replyText: string;
  courseTitle?: string;
  courseSlug: string;
  lessonId: string;
}): Promise<MailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sakilhub.com";
  const lessonUrl = `${baseUrl}/learn/${data.courseSlug}/${data.lessonId}`;

  const html = createEmailLayout({
    title: "Your Question Has Been Answered - Sakil Hub",
    preheader: `MH Sakil replied to your question in ${data.courseTitle || "the classroom"}.`,
    headline: "Instructor Answered Your Question 💬",
    contentHtml: `
      <p>Hello ${data.studentName || "Student"},</p>
      <p>Your question in <strong>${data.courseTitle || "the classroom"}</strong> has been answered by the instructor!</p>
      
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 13px;">
        <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Your Question:</span>
        <p style="margin: 4px 0 0 0; color: #e2e8f0; font-style: italic;">"${data.question}"</p>
      </div>

      <div style="background: rgba(0,210,255,0.05); border-left: 3px solid #00d2ff; border-radius: 0 8px 8px 0; padding: 14px; margin: 16px 0; font-size: 14px;">
        <span style="color: #00d2ff; font-weight: 700; font-size: 12px;">MH Sakil / Instructor Reply:</span>
        <p style="margin: 6px 0 0 0; color: #ffffff; line-height: 1.6;">${data.replyText}</p>
      </div>

      <p>You can view the full discussion thread directly in your classroom lesson player.</p>
    `,
    ctaText: "Open Lesson in Classroom",
    ctaUrl: lessonUrl,
  });

  return sendMail({
    to: data.to,
    subject: `[Answered] Instructor replied to your question in ${data.courseTitle || "Classroom"} 🎬`,
    html,
  });
}
