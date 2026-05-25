"use client";

import { useAuth, useClerk } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { Navigate } from "react-router-dom";
import { Button } from "@flashycardy/ui/button";

export function AuthGateScreen() {
  const t = useTranslations("Auth");
  const home = useTranslations("HomePage");
  const extension = useTranslations("Extension");
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

  if (!isLoaded) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-6 text-muted-foreground">
        {extension("loading")}
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{home("heading")}</h1>
        <p className="text-sm text-muted-foreground">{home("tagline")}</p>
        <p className="text-xs text-muted-foreground">{extension("authHint")}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="min-w-[140px]"
          onClick={() => clerk.openSignIn({})}
        >
          {t("signIn")}
        </Button>
        <Button
          variant="outline"
          className="min-w-[140px]"
          onClick={() => clerk.openSignUp({})}
        >
          {t("signUp")}
        </Button>
      </div>
    </div>
  );
}
