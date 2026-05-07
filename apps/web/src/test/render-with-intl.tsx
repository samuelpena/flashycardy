import type { ReactElement, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render } from "@testing-library/react";
import en from "../../messages/en.json";

/** English messages for tests that need the raw catalog. */
export const enMessages = en;

/**
 * Wraps UI with `NextIntlClientProvider` using English messages for unit tests.
 *
 * @param ui - React tree to render
 * @returns `render` result from React Testing Library
 */
export function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

/**
 * Provider wrapper for `render` custom `wrapper` option.
 *
 * @param props - React children
 */
export function IntlTestProvider({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      {children}
    </NextIntlClientProvider>
  );
}
