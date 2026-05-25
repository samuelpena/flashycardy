"use client";

import { SignedIn, UserButton } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@flashycardy/ui";
import { cn } from "@flashycardy/ui/lib/utils";

export function ExtensionHeader() {
  const t = useTranslations("Common");
  const location = useLocation();

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-semibold text-foreground">{t("appName")}</span>
        <nav className="flex gap-1 text-sm">
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({
                variant: location.pathname === "/dashboard" ? "secondary" : "ghost",
                size: "sm",
              }),
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/analytics"
            className={cn(
              buttonVariants({
                variant: location.pathname === "/analytics" ? "secondary" : "ghost",
                size: "sm",
              }),
            )}
          >
            Analytics
          </Link>
          <Link
            to="/settings"
            className={cn(
              buttonVariants({
                variant: location.pathname === "/settings" ? "secondary" : "ghost",
                size: "sm",
              }),
            )}
          >
            Settings
          </Link>
        </nav>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
