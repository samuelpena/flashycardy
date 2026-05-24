import { getRequestConfig } from "next-intl/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { enMessages, esMessages } from "@flashycardy/i18n";
import { normalizeLocale, type AppLocale } from "./config";

const messagesByLocale = {
  en: enMessages,
  es: esMessages,
} as const satisfies Record<AppLocale, typeof enMessages>;

async function resolveLocale(): Promise<AppLocale> {
  const { userId } = await auth();
  if (userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
    const raw = meta?.language;
    return normalizeLocale(raw);
  }
  const store = await cookies();
  return normalizeLocale(store.get("locale")?.value);
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
