import crypto from "crypto";
import { readDataFile, writeDataFile } from "./storage-helper";

const RESETS_FILE = "password-resets.json";
const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export interface PasswordResetRecord {
  id: string;
  email: string;
  otp: string;
  token: string;
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

/**
 * Creates and persists a secure 6-digit OTP and reset token with 15-minute expiration
 */
export async function createPasswordResetRecord(
  email: string
): Promise<{ otp: string; token: string; expiresAt: number }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Invalidate any existing unused records for this email
  const records = await readDataFile<PasswordResetRecord[]>(RESETS_FILE, []);
  const activeRecords = records.filter(
    (r) => r.email !== normalizedEmail || r.used
  );

  // Generate 6-digit numeric OTP (100000 - 999999)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Generate secure URL token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  const newRecord: PasswordResetRecord = {
    id: `reset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    email: normalizedEmail,
    otp,
    token,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString(),
  };

  activeRecords.push(newRecord);
  await writeDataFile(RESETS_FILE, activeRecords);

  return { otp, token, expiresAt };
}

/**
 * Validates an OTP or token against persistent storage
 */
export async function verifyPasswordResetTokenOrOtp(
  email: string,
  otpOrToken: string
): Promise<{ valid: boolean; record?: PasswordResetRecord; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanInput = otpOrToken.trim();

  const records = await readDataFile<PasswordResetRecord[]>(RESETS_FILE, []);
  const record = records.find(
    (r) =>
      r.email === normalizedEmail &&
      !r.used &&
      (r.otp === cleanInput || r.token === cleanInput)
  );

  if (!record) {
    return {
      valid: false,
      error: "Invalid or expired verification code. Please request a new one.",
    };
  }

  if (Date.now() > record.expiresAt) {
    return {
      valid: false,
      error: "The verification code has expired (15-minute limit exceeded).",
    };
  }

  return { valid: true, record };
}

/**
 * Marks a password reset record as consumed
 */
export async function markPasswordResetAsUsed(recordId: string): Promise<void> {
  const records = await readDataFile<PasswordResetRecord[]>(RESETS_FILE, []);
  const idx = records.findIndex((r) => r.id === recordId);
  if (idx !== -1) {
    records[idx].used = true;
    await writeDataFile(RESETS_FILE, records);
  }
}
