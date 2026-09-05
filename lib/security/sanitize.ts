/**
 * Server-Side Anti-XSS and Payload Sanitization Utility
 * Cleans string inputs to prevent HTML tag injection, script execution, and payload tampering.
 */

const HTML_TAG_REGEX = /<[^>]*>/g;
const DANGEROUS_PROTOCOLS_REGEX = /(?:javascript|vbscript|data|file):/gi;
const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;

/**
 * Sanitizes a single string by stripping HTML tags, dangerous URL protocols,
 * and inline DOM event handlers.
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(HTML_TAG_REGEX, "") // Strip HTML tags
    .replace(DANGEROUS_PROTOCOLS_REGEX, "") // Strip javascript:, data:, etc.
    .replace(EVENT_HANDLER_REGEX, "") // Strip onclick=, onerror=, etc.
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Strip control characters
    .trim();
}

/**
 * Recursively sanitizes all string properties within an object or array.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    return sanitizeString(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeObject(value);
    }
    return sanitizedObj as T;
  }

  return input;
}
