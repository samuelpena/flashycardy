"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import { SettingsPage } from "@/components/settings-page";

/**
 * Gear icon for Clerk profile nav. Uses `forwardRef` so Clerk’s
 * `ExternalElementMounter` can attach a ref and render the SVG in the navbar slot.
 */
const SettingsGearIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(function SettingsGearIcon(props, ref) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="block shrink-0 text-current"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.2.8.6.9H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
});

/**
 * Renders the Clerk user menu with an in-profile Settings page.
 */
export function AppUserButton() {
  return (
    <UserButton>
      <UserButton.UserProfilePage
        label="Settings"
        labelIcon={<SettingsGearIcon />}
        url="settings"
      >
        <SettingsPage />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
