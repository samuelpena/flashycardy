"use client";

import { ClerkProvider } from "@clerk/chrome-extension";
import {
  defaultLocale,
  enMessages,
  esMessages,
  FlashycardyIntlProvider,
  type AppLocale,
} from "@flashycardy/i18n";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getExtensionEnv } from "@/lib/env";
import { getAuthCallbackUrl, getSidepanelUrl } from "@/lib/extension-url";

type ExtensionProvidersProps = {
  children: ReactNode;
  locale?: AppLocale;
};

export function ExtensionProviders({
  children,
  locale = defaultLocale,
}: ExtensionProvidersProps) {
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

  const messages = locale === "es" ? esMessages : enMessages;

  return (
    <ClerkProvider {...clerkProps}>
      <FlashycardyIntlProvider locale={locale} messages={messages}>
        {children}
      </FlashycardyIntlProvider>
    </ClerkProvider>
  );
}
