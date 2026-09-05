/**
 * Enterprise Cookie Configuration Helper
 * Supports direct VPS IP access over HTTP and production custom domains over HTTPS.
 *
 * When accessed via HTTP (e.g. http://3.6.15.167:3000), cookies MUST have `secure: false`
 * so browsers (Chrome, Edge, Safari, Firefox) do not reject/drop them.
 * When accessed via HTTPS or when COOKIE_SECURE=true is configured in .env,
 * cookies will enforce HTTPS transmission.
 */

export function getSessionCookieOptions(customMaxAgeSeconds?: number) {
  const isSecure = process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: customMaxAgeSeconds ?? 60 * 60 * 24 * 7, // 7 days default
  };
}

export function getPublicCookieOptions(customMaxAgeSeconds?: number) {
  const isSecure = process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: false,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: customMaxAgeSeconds ?? 60 * 60 * 24 * 7, // 7 days default
  };
}
