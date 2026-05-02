import { getTranslations } from "next-intl/server";
import { AppUserButton } from "@/components/app-user-button";

/**
 * Wraps analytics pages with a sticky top nav containing the app wordmark and
 * the Clerk `UserButton` for account management.
 *
 * @param props.children - The analytics page content to render below the header
 */
export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Common");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-lg font-semibold tracking-tight">
            {t("appName")}
          </span>
          <AppUserButton />
        </div>
      </header>
      {children}
    </>
  );
}
