import Medusa from "@medusajs/medusa-js";

/**
 * Medusa.js Client Configuration
 * Initializes the client singleton reading strictly from environment variables.
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  maxRetries: 3,
  publishableApiKey: PUBLISHABLE_API_KEY,
});

export default medusa;
