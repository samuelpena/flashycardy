export const PAGE_TEXT_MAX_LENGTH = 50_000;
export const PAGE_TEXT_MIN_LENGTH = 100;

export type PageOriginCheck = {
  supported: boolean;
  reason?: "chrome" | "extension" | "file" | "about" | "invalid";
};

/**
 * Returns whether the active tab URL supports “Generate from this page”.
 */
export function isSupportedPageOrigin(url: string | undefined | null): PageOriginCheck {
  if (!url?.trim()) {
    return { supported: false, reason: "invalid" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { supported: false, reason: "invalid" };
  }

  const protocol = parsed.protocol;
  if (protocol === "chrome:" || protocol === "chrome-extension:") {
    return { supported: false, reason: protocol === "chrome:" ? "chrome" : "extension" };
  }
  if (protocol === "file:") {
    return { supported: false, reason: "file" };
  }
  if (protocol === "about:") {
    return { supported: false, reason: "about" };
  }
  if (protocol === "http:" || protocol === "https:") {
    return { supported: true };
  }

  return { supported: false, reason: "invalid" };
}

export type TruncatePageTextResult = {
  text: string;
  truncated: boolean;
};

export function truncatePageText(
  text: string,
  maxLength = PAGE_TEXT_MAX_LENGTH,
): TruncatePageTextResult {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return { text: normalized, truncated: false };
  }
  return { text: normalized.slice(0, maxLength), truncated: true };
}

export type ExtractedPageContent = {
  pageText: string;
  pageUrl: string;
  pageTitle: string;
};

/**
 * Reads visible page text from a tab via `chrome.scripting.executeScript`.
 * Caller must ensure the tab URL passes {@link isSupportedPageOrigin}.
 */
export async function extractPageContentFromTab(
  tabId: number,
): Promise<ExtractedPageContent> {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({
      pageText: document.body?.innerText ?? "",
      pageUrl: location.href,
      pageTitle: document.title,
    }),
  });

  if (!result?.result) {
    throw new Error("Could not read page content");
  }

  return result.result as ExtractedPageContent;
}

/**
 * Resolves the active tab in the current window for page extraction.
 */
export async function getActiveTabInCurrentWindow(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}
