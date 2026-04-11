import { expect, test, describe } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  test("merges multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("filters out falsy conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  test("deduplicates conflicting tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  test("handles undefined and null without throwing", () => {
    expect(cn("foo", undefined, null as never, "bar")).toBe("foo bar");
  });

  test("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  test("handles object syntax for conditional classes", () => {
    expect(cn({ active: true, hidden: false })).toBe("active");
  });

  test("merges array of class names", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});
