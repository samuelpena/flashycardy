"use client";

import { SignedIn, UserButton, Protect } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@flashycardy/ui/badge";
import { buttonVariants } from "@flashycardy/ui";
import { cn } from "@flashycardy/ui/lib/utils";
import { openPricingTab } from "@/lib/open-pricing";
import { GenerateFromPageButton } from "@/components/generate-from-page-button";

export function ExtensionHeader() {
  const t = useTranslations("Common");
  const tExt = useTranslations("Extension");
  const location = useLocation();

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      className={cn(
        buttonVariants({
          variant: location.pathname === path ? "secondary" : "ghost",
          size: "sm",
        }),
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-semibold text-foreground">{t("appName")}</span>
        <nav className="flex gap-1 text-sm">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/analytics", "Analytics")}
          {navLink("/settings", "Settings")}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <GenerateFromPageButton />
        <Protect feature="unlimited_decks" fallback={
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => openPricingTab()}
          >
            {tExt("goPro")}
          </Badge>
        }>
          <span />
        </Protect>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
