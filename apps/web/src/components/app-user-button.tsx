"use client";

import { UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { SettingsPage } from "@/components/settings-page";

const DOCS_BASE_URL = "https://flashycardy-docs.vercel.app/";

/**
 * Filled help mark for the UserButton menu; uses `currentColor` so Clerk’s popover
 * chrome controls contrast (icon is portaled into CustomItemButtonIconBox).
 */
function HelpMenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="size-4 shrink-0"
      style={{ color: "inherit" }}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  );
}

/**
 * Renders the Clerk user menu with docs in the popover (below Manage account) and a Settings profile page.
 */
export function AppUserButton() {
  const t = useTranslations("ClerkProfile");

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action label="manageAccount" />
        <UserButton.Action
          label={t("helpDocsLabel")}
          labelIcon={<HelpMenuIcon />}
          onClick={() => {
            window.open(DOCS_BASE_URL, "_blank", "noopener,noreferrer");
          }}
        />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
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
