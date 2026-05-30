import { describe, expect, test } from "vitest";
import {
  isSupportedPageOrigin,
  PAGE_TEXT_MIN_LENGTH,
  truncatePageText,
} from "./page-content";

describe("isSupportedPageOrigin", () => {
  test("allows http and https", () => {
    expect(isSupportedPageOrigin("https://example.com/article").supported).toBe(true);
    expect(isSupportedPageOrigin("http://localhost:3000/dashboard").supported).toBe(true);
  });

  test("blocks chrome and extension URLs", () => {
    expect(isSupportedPageOrigin("chrome://extensions").supported).toBe(false);
    expect(isSupportedPageOrigin("chrome-extension://abc/sidepanel.html").supported).toBe(
      false,
    );
  });

  test("blocks file and about URLs", () => {
    expect(isSupportedPageOrigin("file:///tmp/page.html").supported).toBe(false);
    expect(isSupportedPageOrigin("about:blank").supported).toBe(false);
  });

  test("blocks invalid URLs", () => {
    expect(isSupportedPageOrigin("").supported).toBe(false);
    expect(isSupportedPageOrigin("not-a-url").supported).toBe(false);
  });
});

describe("truncatePageText", () => {
  test("trims whitespace", () => {
    expect(truncatePageText("  hello   world  ").text).toBe("hello world");
  });

  test("truncates beyond max length", () => {
    const long = "a".repeat(60_000);
    const result = truncatePageText(long, 50_000);
    expect(result.text).toHaveLength(50_000);
    expect(result.truncated).toBe(true);
  });

  test("min length constant matches API", () => {
    expect(PAGE_TEXT_MIN_LENGTH).toBe(100);
  });
});
