import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppUserButton } from "@/components/app-user-button";

export default async function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Common");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            {t("appName")}
          </Link>
          <AppUserButton />
        </div>
      </header>
      {children}
    </>
  );
}
