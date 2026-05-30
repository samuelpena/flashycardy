import { expect, sidepanelUrl, test } from "./fixtures/extension";

test.describe("Extension smoke — unauthenticated", () => {
  test("loads side panel and shows sign-in gate", async ({ sidepanel }) => {
    await expect(sidepanel.getByRole("button", { name: "Sign in" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(sidepanel.getByRole("heading", { name: "Flashycardy" })).toBeVisible();
    await expect(sidepanel.getByRole("button", { name: "Sign up" })).toBeVisible();
  });

  test("protected routes redirect to auth gate", async ({ sidepanel, extensionId }) => {
    await sidepanel.goto(sidepanelUrl(extensionId, "/dashboard"));
    await expect(sidepanel.getByRole("button", { name: "Sign in" })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("new-card route prompts sign-in when unauthenticated", async ({
    sidepanel,
    extensionId,
  }) => {
    await sidepanel.goto(sidepanelUrl(extensionId, "/decks/new-card"));
    await expect(
      sidepanel.getByText("Sign in to save this selection as a flashcard"),
    ).toBeVisible({ timeout: 30_000 });
  });

  test("pending route from session storage opens new-card screen", async ({
    extensionContext,
    extensionId,
  }) => {
    const worker = extensionContext.serviceWorkers()[0];
    if (!worker) {
      test.skip(true, "Extension service worker not available");
    }

    await worker!.evaluate(async () => {
      await chrome.storage.session.set({
        "prefill-front": "E2E selection text",
        "pending-route": "/decks/new-card",
      });
    });

    const page = await extensionContext.newPage();
    await page.goto(sidepanelUrl(extensionId, "/"));

    await expect(page).toHaveURL(/#\/decks\/new-card$/, { timeout: 15_000 });
    await expect(
      page.getByText("Sign in to save this selection as a flashcard"),
    ).toBeVisible({ timeout: 30_000 });
  });
});
