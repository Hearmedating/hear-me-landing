// Centralised brand/contact constants. Single source of truth.
export const SUPPORT_EMAIL = "hello@hearmedating.com";
export const APP_NAME = "HEAR ME";
export const APP_TAGLINE = "Listen first. Judge later.";
export const APP_WEBSITE = "https://hearmedating.com";

/**
 * Build a mailto: URL that opens the user's email client with a pre-filled
 * subject + body. Works on iOS/Android/web.
 */
export function supportMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${SUPPORT_EMAIL}${qs ? `?${qs}` : ""}`;
}
