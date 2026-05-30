"use client";

import { ClerkProvider } from "@clerk/chrome-extension";
import { useUser } from "@clerk/chrome-extension";
import {
  defaultLocale,
  enMessages,
  esMessages,
  FlashycardyIntlProvider,
  normalizeLocale,
  type AppLocale,
} from "@flashycardy/i18n";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getExtensionEnv } from "@/lib/env";
import { getAuthCallbackUrl, getSidepanelUrl } from "@/lib/extension-url";

type ExtensionProvidersProps = {
  children: ReactNode;
};

function IntlFromClerkUser({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();

  const locale = useMemo<AppLocale>(() => {
    if (!user) return defaultLocale;
    const meta = user.unsafeMetadata as Record<string, unknown> | undefined;
    return normalizeLocale(meta?.language);
  }, [user]);

  const messages = locale === "es" ? esMessages : enMessages;

  if (!isLoaded) {
    return null;
  }

  return (
    <FlashycardyIntlProvider locale={locale} messages={messages}>
      {children}
    </FlashycardyIntlProvider>
  );
}

export function ExtensionProviders({ children }: ExtensionProvidersProps) {
  const navigate = useNavigate();
  const env = getExtensionEnv();
  const afterAuth = getSidepanelUrl("/dashboard");

  const clerkProps = useMemo(
    () => ({
      publishableKey: env.clerkPublishableKey,
      syncHost: env.syncHost,
      afterSignOutUrl: afterAuth,
      signInFallbackRedirectUrl: getAuthCallbackUrl(),
      signUpFallbackRedirectUrl: getAuthCallbackUrl(),
      routerPush: (to: string) => navigate(to),
      routerReplace: (to: string) => navigate(to, { replace: true }),
    }),
    [env.clerkPublishableKey, env.syncHost, afterAuth, navigate],
  );

  return (
    <ClerkProvider {...clerkProps}>
      <IntlFromClerkUser>{children}</IntlFromClerkUser>
    </ClerkProvider>
  );
}
