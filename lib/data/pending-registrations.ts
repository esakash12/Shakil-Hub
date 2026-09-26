import { readDataFile, writeDataFile } from "./storage-helper";

const PENDING_REG_FILE = "pending-registrations.json";
const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export interface PendingRegistrationRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  otp: string;
  expiresAt: number;
  createdAt: string;
}

/**
 * Creates or updates a pending student registration with a fresh 6-digit OTP
 */
export async function createPendingRegistration(data: {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}): Promise<{ otp: string; expiresAt: number }> {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Remove existing pending registrations for this email
  const records = await readDataFile<PendingRegistrationRecord[]>(
    PENDING_REG_FILE,
    []
  );
  const remaining = records.filter(
    (r) => r.email !== normalizedEmail && Date.now() < r.expiresAt
  );

  // Generate 6-digit numeric OTP (100000 - 999999)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  const newRecord: PendingRegistrationRecord = {
    id: `preg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    email: normalizedEmail,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    passwordHash: data.passwordHash,
    otp,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  remaining.push(newRecord);
  await writeDataFile(PENDING_REG_FILE, remaining);

  return { otp, expiresAt };
}

/**
 * Retrieves a pending registration record by email
 */
export async function getPendingRegistration(
  email: string
): Promise<PendingRegistrationRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const records = await readDataFile<PendingRegistrationRecord[]>(
    PENDING_REG_FILE,
    []
  );
  const found = records.find(
    (r) => r.email === normalizedEmail && Date.now() < r.expiresAt
  );
  return found || null;
}

/**
 * Verifies the OTP and consumes (deletes) the pending record upon success
 */
export async function verifyAndConsumePendingRegistration(
  email: string,
  otp: string
): Promise<{
  valid: boolean;
  registration?: PendingRegistrationRecord;
  error?: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = otp.trim();

  const records = await readDataFile<PendingRegistrationRecord[]>(
    PENDING_REG_FILE,
    []
  );
  const record = records.find((r) => r.email === normalizedEmail);

  if (!record) {
    return {
      valid: false,
      error: "No pending registration found for this email. Please register again.",
    };
  }

  if (Date.now() > record.expiresAt) {
    return {
      valid: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  if (record.otp !== cleanOtp) {
    return {
      valid: false,
      error: "Invalid 6-digit verification code. Please check your email.",
    };
  }

  // Remove consumed record
  const remaining = records.filter((r) => r.id !== record.id);
  await writeDataFile(PENDING_REG_FILE, remaining);

  return { valid: true, registration: record };
}
