import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const extensionPath = path.join(__dirname, "../../.output/chrome-mv3");

export function sidepanelUrl(extensionId: string, hashPath = "/") {
  const hash = hashPath.startsWith("/") ? hashPath : `/${hashPath}`;
  return `chrome-extension://${extensionId}/sidepanel.html#${hash}`;
}

async function resolveExtensionId(context: BrowserContext): Promise<string> {
  const page = await context.newPage();
  await page.goto("about:blank");

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const workers = context.serviceWorkers();
    if (workers.length > 0) {
      const id = workers[0]!.url().split("/")[2];
      if (id) return id;
    }

    try {
      const cdp = await context.newCDPSession(page);
      const { targetInfos } = await cdp.send("Target.getTargets");
      const worker = targetInfos.find(
        (target) =>
          target.type === "service_worker" &&
          target.url.startsWith("chrome-extension://"),
      );
      if (worker) {
        const id = new URL(worker.url).host;
        if (id) return id;
      }
    } catch {
      /* retry */
    }

    await page.waitForTimeout(250);
  }

  throw new Error(
    `Extension service worker did not start. Loaded from ${extensionPath}. Use Google Chrome (channel: "chrome") and verify the build exists.`,
  );
}

type ExtensionFixtures = {
  extensionContext: BrowserContext;
  extensionId: string;
  sidepanel: Page;
};

export const test = base.extend<ExtensionFixtures>({
  extensionContext: async ({}, use) => {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "flashycardy-ext-e2e-"));
    const headless = process.env.CI ? true : false;

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless,
      args: [
        ...(headless ? ["--headless=new"] : []),
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    try {
      await use(context);
    } finally {
      await context.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  },
  extensionId: async ({ extensionContext }, use) => {
    await use(await resolveExtensionId(extensionContext));
  },
  sidepanel: async ({ extensionContext, extensionId }, use) => {
    const page = await extensionContext.newPage();
    await page.goto(sidepanelUrl(extensionId), { waitUntil: "domcontentloaded" });
    await use(page);
  },
});

export { expect } from "@playwright/test";

export function hasExtensionAuthE2eEnv(): boolean {
  return Boolean(
    process.env.E2E_CLERK_USER_EMAIL &&
      process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}
