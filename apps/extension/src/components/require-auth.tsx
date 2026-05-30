"use client";

import { useAuth } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { Navigate } from "react-router-dom";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const extension = useTranslations("Extension");

  if (!isLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6 text-muted-foreground">
        {extension("loading")}
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
