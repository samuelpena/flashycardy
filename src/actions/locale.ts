"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { locales, normalizeLocale, type AppLocale } from "@/i18n/config";

const updateLanguageSchema = z.object({
  locale: z.enum(locales),
});

export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;

/**
 * Persists the user's UI language in Clerk `unsafeMetadata` and relies on
 * `router.refresh()` so the next request re-resolves locale from Clerk.
 *
 * @param input - Zod-validated locale (`en` or `es`)
 * @returns Success or validation / auth error payload
 */
export async function updateUserLanguageAction(input: UpdateLanguageInput) {
  const { userId } = await auth();
  if (!userId) {
    const t = await getTranslations("Actions");
    return { error: t("unauthorized") };
  }

  const parsed = updateLanguageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const locale: AppLocale = normalizeLocale(parsed.data.locale);
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prev = user.unsafeMetadata;
  const base =
    prev && typeof prev === "object" && !Array.isArray(prev)
      ? { ...(prev as Record<string, unknown>) }
      : {};

  await client.users.updateUser(userId, {
    unsafeMetadata: {
      ...base,
      language: locale,
    },
  });

  return { success: true as const };
}
