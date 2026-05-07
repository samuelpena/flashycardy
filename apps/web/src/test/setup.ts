import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import en from "../../messages/en.json";

/**
 * Minimal message interpolation for tests (`{key}` placeholders only).
 *
 * @param template - Message template from JSON
 * @param values - Replacement map
 * @returns Interpolated string
 */
function formatMessage(
  template: string,
  values?: Record<string, unknown>,
): string {
  if (!values) return template;
  let out = template;
  for (const [k, v] of Object.entries(values)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const messages = (en as Record<string, Record<string, string>>)[namespace] ?? {};
    return (key: string, values?: Record<string, unknown>) => {
      const raw = messages[key];
      if (raw === undefined) return key;
      return formatMessage(raw, values);
    };
  },
}));

afterEach(() => {
  cleanup();
});
