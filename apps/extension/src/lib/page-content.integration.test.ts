import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import {
  extractPageContentFromTab,
  truncatePageText,
  PAGE_TEXT_MIN_LENGTH,
} from "./page-content";

describe("extractPageContentFromTab", () => {
  beforeEach(() => {
    vi.stubGlobal("chrome", {
      scripting: {
        executeScript: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("returns extracted page fields from scripting result", async () => {
    vi.mocked(chrome.scripting.executeScript).mockResolvedValue([
      {
        result: {
          pageText: "Article body text ".repeat(20),
          pageUrl: "https://example.com/post",
          pageTitle: "Example Post",
        },
      },
    ] as unknown as Awaited<ReturnType<typeof chrome.scripting.executeScript>>);

    const content = await extractPageContentFromTab(42);
    expect(content.pageUrl).toBe("https://example.com/post");
    expect(content.pageTitle).toBe("Example Post");
    expect(truncatePageText(content.pageText).text.length).toBeGreaterThan(
      PAGE_TEXT_MIN_LENGTH,
    );
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
      expect.objectContaining({ target: { tabId: 42 } }),
    );
  });

  test("throws when scripting returns no result", async () => {
    vi.mocked(chrome.scripting.executeScript).mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof chrome.scripting.executeScript>>,
    );
    await expect(extractPageContentFromTab(1)).rejects.toThrow("Could not read page content");
  });
});
