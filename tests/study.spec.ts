import { test, expect } from "./axe-test";

/**
 * E2E tests for the Study page (src/app/decks/[deckUuid]/study/page.tsx)
 *
 * Invalid deck UUIDs are rejected before any study data is loaded, so these
 * coverage checks assert the built-in 404 experience for malformed routes.
 */
test.describe("Study page — invalid route", () => {
  test("shows the not found page for a malformed deck UUID", async ({ page }) => {
    await page.goto("/decks/not-a-uuid/study");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
  });

  test("keeps the malformed study URL when rendering the not found page", async ({ page }) => {
    await page.goto("/decks/not-a-uuid/study");
    await expect(page).toHaveURL("/decks/not-a-uuid/study");
  });
});

test.describe("Study page — accessibility", () => {
  test("not found page should not have any WCAG A/AA violations", async ({ page, makeAxeBuilder }) => {
    await page.goto("/decks/not-a-uuid/study");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
