import { getRequestConfig } from "next-intl/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { normalizeLocale, type AppLocale } from "./config";

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
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
