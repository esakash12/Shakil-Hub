import { z } from "zod";

/**
 * Standard Bangladeshi 11-digit mobile number schema.
 * Must be exactly 11 digits, numeric only, starting with "013", "014", "015", "016", "017", "018", or "019".
 */
export const bangladeshiPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(
    (val) => /^01[3-9]\d{8}$/.test(val),
    "Enter a valid 11-digit phone number (e.g. 01712345678)"
  );

/**
 * Strict Standard Email Schema
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address (e.g. name@domain.com)")
  .max(100, "Email cannot exceed 100 characters")
  .toLowerCase();

/**
 * Name/Text Validation Schema: 2 to 50 characters, trimmed
 */
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(50, "Full name cannot exceed 50 characters");

/**
 * Manual Payment Transaction ID Schema
 */
export const trxIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, "Transaction ID must be at least 4 characters")
  .max(25, "Transaction ID cannot exceed 25 characters")
  .regex(/^[A-Z0-9]+$/, "Transaction ID must contain only alphanumeric characters");

/**
 * Course Checkout Form Schema (Step 1: Student Details)
 */
export const courseCheckoutFormSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: bangladeshiPhoneSchema,
  whatsappNumber: bangladeshiPhoneSchema,
});

/**
 * Product Checkout Form Schema (Step 1: Digital Asset Customer Details)
 */
export const productCheckoutFormSchema = z.object({
  fullName: nameSchema,
  whatsappNumber: bangladeshiPhoneSchema,
});

/**
 * Gateway Payment Submission Schema (Step 2: Verification Input)
 */
export const gatewaySubmissionSchema = z.object({
  senderNumber: bangladeshiPhoneSchema,
  trxId: trxIdSchema,
});

/**
 * Full Backend Payload Schema for processManualCheckout Server Action
 */
export const manualCheckoutPayloadSchema = z.object({
  courseSlug: z.string().trim().min(1, "Course or product selection is required"),
  senderNumber: bangladeshiPhoneSchema,
  trxId: trxIdSchema,
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "card"]).default("bkash"),
  fullName: nameSchema,
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsappNumber: bangladeshiPhoneSchema.optional().or(z.literal("")),
  itemType: z.enum(["course", "product"]).default("course"),
});

/**
 * Admin Login Credentials Schema
 */
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});
