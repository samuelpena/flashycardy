import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Deck detail page (src/app/decks/[deckId]/page.tsx)
 *
 * async Server Component: fetches auth state and the deck (with cards) from
 * the database, and redirects unauthenticated users to the home page.
 */
test.describe("Deck detail page — unauthenticated", () => {
  test("redirects to home when not signed in", async ({ page }) => {
    await page.goto("/decks/1");
    await expect(page).toHaveURL("/");
  });

  test("home page is shown after redirect with Sign In button visible", async ({ page }) => {
    await page.goto("/decks/1");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});
