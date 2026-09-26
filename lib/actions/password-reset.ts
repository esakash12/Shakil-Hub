"use server";

import {
  findCustomerByEmail,
  hashPassword,
  updateCustomerPasswordHash,
} from "@/lib/data/customers";
import {
  createPasswordResetRecord,
  verifyPasswordResetTokenOrOtp,
  markPasswordResetAsUsed,
} from "@/lib/data/password-resets";
import {
  sendPasswordResetOtpEmail,
  sendPasswordChangedAlertEmail,
} from "@/lib/mail";

export interface ForgotPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server Action: Initiates a password reset request and sends the OTP/reset link via SMTP email
 */
export async function requestPasswordResetAction(
  email: string
): Promise<ForgotPasswordResult> {
  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const customer = await findCustomerByEmail(normalizedEmail);
    if (!customer) {
      // Security best practice: don't reveal whether the user exists, but here we can return friendly guidance
      return {
        success: true,
        message:
          "If an account exists with this email, a verification code has been sent. Please check your inbox and spam folder.",
      };
    }

    const name = customer.firstName
      ? `${customer.firstName} ${customer.lastName || ""}`.trim()
      : "Creator";

    const { otp, token } = await createPasswordResetRecord(normalizedEmail);

    // Send SMTP Email
    await sendPasswordResetOtpEmail(normalizedEmail, name, otp, token);

    return {
      success: true,
      message:
        "A 6-digit verification code and reset link have been sent to your email. Valid for 15 minutes.",
    };
  } catch (err: any) {
    console.error("REQUEST PASSWORD RESET ERROR:", err);
    return {
      success: false,
      error: "An error occurred while sending the reset code. Please try again.",
    };
  }
}

/**
 * Server Action: Verifies the OTP/token and resets the user's password
 */
export async function resetPasswordWithTokenOrOtpAction(
  email: string,
  otpOrToken: string,
  newPassword: string
): Promise<ResetPasswordResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Valid email address is required." };
  }
  if (!otpOrToken || otpOrToken.trim().length === 0) {
    return { success: false, error: "Verification code or token is required." };
  }
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "New password must be at least 6 characters long.",
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const customer = await findCustomerByEmail(normalizedEmail);
    if (!customer) {
      return { success: false, error: "Account not found." };
    }

    // Verify OTP or Token
    const verification = await verifyPasswordResetTokenOrOtp(
      normalizedEmail,
      otpOrToken
    );

    if (!verification.valid || !verification.record) {
      return {
        success: false,
        error: verification.error || "Invalid or expired verification code.",
      };
    }

    // Hash new password using enterprise bcrypt
    const newHash = hashPassword(newPassword);
    const updated = await updateCustomerPasswordHash(normalizedEmail, newHash);

    if (!updated) {
      return {
        success: false,
        error: "Failed to update password. Please try again.",
      };
    }

    // Invalidate the reset token
    await markPasswordResetAsUsed(verification.record.id);

    // Send Security Confirmation Email
    const name = customer.firstName || "Student";
    await sendPasswordChangedAlertEmail(normalizedEmail, name).catch(() => {});

    return {
      success: true,
      message:
        "Password has been reset successfully! You can now log in with your new password.",
    };
  } catch (err: any) {
    console.error("RESET PASSWORD ACTION ERROR:", err);
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}
