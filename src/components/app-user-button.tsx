"use client";

import { UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { SettingsPage } from "@/components/settings-page";

/**
 * Renders the Clerk user menu with an in-profile Settings page.
 */
export function AppUserButton() {
  const t = useTranslations("ClerkProfile");

  return (
    <UserButton>
      <UserButton.UserProfilePage
        label={t("settingsLabel")}
        labelIcon={
          <Settings
            aria-hidden
            className="size-4 shrink-0 opacity-100"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "var(--cl-chromeText, var(--foreground, currentColor))" }}
          />
        }
        url="settings"
      >
        <SettingsPage />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
