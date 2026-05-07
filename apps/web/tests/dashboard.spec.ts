import { test, expect } from "./axe-test";

/**
 * E2E tests for the Dashboard page (src/app/dashboard/page.tsx)
 *
 * async Server Component: fetches auth state and user decks from the database,
 * and redirects unauthenticated users to the home page.
 *
 * Pagination notes:
 *  - Pagination nav is rendered server-side and only shown when there are >9 decks.
 *  - Navigation is URL-based via the `?page` search parameter.
 *  - Authenticated pagination flows (page navigation, active state, ellipsis) require
 *    a seeded test user with 10+ decks and should be covered by authenticated E2E tests.
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

  test("redirects to home when accessing a paginated URL without being signed in", async ({ page }) => {
    await page.goto("/dashboard?page=2");
    await expect(page).toHaveURL("/");
  });

  test("redirects to home when accessing an invalid page parameter without being signed in", async ({ page }) => {
    await page.goto("/dashboard?page=abc");
    await expect(page).toHaveURL("/");
  });

  test("redirects to home when accessing an out-of-range page without being signed in", async ({ page }) => {
    await page.goto("/dashboard?page=9999");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Dashboard page — accessibility", () => {
  test("redirected home page should not have any WCAG A/AA violations", async ({ page, makeAxeBuilder }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("paginated URL redirect should not have any WCAG A/AA violations", async ({ page, makeAxeBuilder }) => {
    await page.goto("/dashboard?page=2");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
