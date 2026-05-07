"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const t = useTranslations("Auth");

  return (
    <div className="flex items-center gap-3">
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant="ghost">{t("signIn")}</Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button>{t("signUp")}</Button>
      </SignUpButton>
    </div>
  );
}
