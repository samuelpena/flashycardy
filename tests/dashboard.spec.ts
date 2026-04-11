import { test, expect } from "@playwright/test";

/**
 * E2E tests for the Dashboard page (src/app/dashboard/page.tsx)
 *
 * async Server Component: fetches auth state and user decks from the database,
 * and redirects unauthenticated users to the home page.
 */
test.describe("Dashboard page — unauthenticated", () => {
  test("redirects to home when not signed in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });

  test("home page is shown after redirect with Sign In button visible", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});
