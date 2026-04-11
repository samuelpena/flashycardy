import { test, expect } from "./axe-test";

/**
 * E2E tests for the Home page (src/app/page.tsx)
 *
 * async Server Component: fetches auth state and conditionally redirects
 * or renders the landing UI for unauthenticated visitors.
 */
test.describe("Home page — unauthenticated", () => {
  test("renders the app name heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Flashycardy" })).toBeVisible();
  });

  test("renders the tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Your personal flashcard platform")).toBeVisible();
  });

  test("renders Sign In and Sign Up buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
  });
});

test.describe("Home page — accessibility", () => {
  test("should not have any WCAG A/AA violations", async ({ page, makeAxeBuilder }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Flashycardy" })).toBeVisible();

    const accessibilityScanResults = await makeAxeBuilder().analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
