import { test, expect } from "./axe-test";

/**
 * E2E tests for the Deck detail page (src/app/decks/[deckUuid]/page.tsx)
 *
 * Invalid deck UUIDs are rejected before any deck data is loaded, so these
 * coverage checks assert the built-in 404 experience for malformed routes.
 */
test.describe("Deck detail page — invalid route", () => {
  test("shows the not found page for a malformed deck UUID", async ({ page }) => {
    await page.goto("/decks/not-a-uuid");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
  });

  test("keeps the malformed deck URL when rendering the not found page", async ({ page }) => {
    await page.goto("/decks/not-a-uuid");
    await expect(page).toHaveURL("/decks/not-a-uuid");
  });
});

test.describe("Deck detail page — accessibility", () => {
  test("not found page should not have any WCAG A/AA violations", async ({ page, makeAxeBuilder }) => {
    await page.goto("/decks/not-a-uuid");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
