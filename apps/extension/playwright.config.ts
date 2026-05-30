import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionBuildDir = path.join(__dirname, ".output/chrome-mv3");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",
  use: {
    trace: "on-first-retry",
  },
  globalSetup: "./tests/global-setup.ts",
  webServer: {
    command: "pnpm --filter @flashycardy/web start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "extension-smoke",
      testMatch: /smoke\.spec\.ts/,
    },
    {
      name: "extension-authenticated",
      testMatch: /authenticated\.spec\.ts/,
    },
  ],
});

export { extensionBuildDir };
