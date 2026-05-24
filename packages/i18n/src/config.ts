export const locales = ["en", "es"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

/**
 * Normalizes a raw locale value to a supported app locale.
 *
 * @param raw - Value from Clerk metadata, cookies, or user input
 * @returns `es` when raw is `es`, otherwise `en`
 */
export function normalizeLocale(raw: unknown): AppLocale {
  return raw === "es" ? "es" : "en";
}
