"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import type { AppLocale } from "./config";

export type FlashycardyIntlProviderProps = {
  locale: AppLocale;
  messages: Record<string, unknown>;
  children: ReactNode;
};

/**
 * Client `next-intl` provider for the Chrome extension and other non-Next hosts.
 */
export function FlashycardyIntlProvider({
  locale,
  messages,
  children,
}: FlashycardyIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
