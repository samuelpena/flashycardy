import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, hasExtensionAuthE2eEnv, sidepanelUrl, test } from "./fixtures/extension";

test.describe("Extension authenticated flows", () => {
  test.skip(
    !hasExtensionAuthE2eEnv(),
    "Set E2E_CLERK_USER_EMAIL, CLERK_SECRET_KEY, and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  );

  test.beforeAll(async () => {
    await clerkSetup();
  });

  test("syncHost session opens dashboard", async ({ extensionContext, extensionId }) => {
    const webPage = await extensionContext.newPage();
    await webPage.goto("http://localhost:3000/");
    await clerk.signIn({
      page: webPage,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    });

    const sidepanel = await extensionContext.newPage();
    await sidepanel.goto(sidepanelUrl(extensionId, "/dashboard"));
    await expect(sidepanel.getByRole("heading", { name: "Your Decks" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("create deck and open deck detail", async ({ extensionContext, extensionId }) => {
    const webPage = await extensionContext.newPage();
    await webPage.goto("http://localhost:3000/");
    await clerk.signIn({
      page: webPage,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    });

    const sidepanel = await extensionContext.newPage();
    await sidepanel.goto(sidepanelUrl(extensionId, "/dashboard"));
    await expect(sidepanel.getByRole("heading", { name: "Your Decks" })).toBeVisible({
      timeout: 15_000,
    });

    const deckName = `E2E Extension ${Date.now()}`;
    await sidepanel.getByRole("button", { name: "New Deck" }).click();
    await sidepanel.getByLabel("Name").fill(deckName);
    await sidepanel.getByRole("button", { name: "Create deck" }).click();

    await expect(sidepanel.getByRole("link", { name: deckName })).toBeVisible({
      timeout: 15_000,
    });
    await sidepanel.getByRole("link", { name: deckName }).click();
    await expect(sidepanel.getByRole("heading", { name: deckName })).toBeVisible();
  });

  test("study and analytics navigation", async ({ extensionContext, extensionId }) => {
    const webPage = await extensionContext.newPage();
    await webPage.goto("http://localhost:3000/");
    await clerk.signIn({
      page: webPage,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    });

    const sidepanel = await extensionContext.newPage();
    await sidepanel.goto(sidepanelUrl(extensionId, "/dashboard"));
    await expect(sidepanel.getByRole("heading", { name: "Your Decks" })).toBeVisible({
      timeout: 15_000,
    });

    await sidepanel.getByRole("link", { name: "Analytics" }).click();
    await expect(sidepanel).toHaveURL(/#\/analytics$/);

    await sidepanel.goto(sidepanelUrl(extensionId, "/dashboard"));
    await expect(sidepanel.getByRole("heading", { name: "Your Decks" })).toBeVisible();
    const deckLink = sidepanel.locator('main a[href^="#/decks/"]').first();
    if ((await deckLink.count()) === 0) {
      test.skip(true, "No decks available for study navigation");
    }
    await deckLink.click();
    await sidepanel.getByRole("link", { name: "Study" }).click();
    await expect(sidepanel).toHaveURL(/#\/decks\/[^/]+\/study$/);
  });

  test("context menu prefill on new-card when signed in", async ({
    extensionContext,
    extensionId,
  }) => {
    const webPage = await extensionContext.newPage();
    await webPage.goto("http://localhost:3000/");
    await clerk.signIn({
      page: webPage,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    });

    const worker = extensionContext.serviceWorkers()[0];
    if (!worker) {
      test.skip(true, "Extension service worker not available");
    }

    await worker!.evaluate(async () => {
      await chrome.storage.session.set({
        "prefill-front": "E2E authenticated prefill",
        "pending-route": "/decks/new-card",
      });
    });

    const sidepanel = await extensionContext.newPage();
    await sidepanel.goto(sidepanelUrl(extensionId, "/"));
    await expect(sidepanel).toHaveURL(/#\/decks\/new-card$/);
    await expect(sidepanel.locator("#card-front")).toHaveValue("E2E authenticated prefill");
  });
});
