import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.join(__dirname, "..");
const manifestPath = path.join(extensionRoot, ".output/chrome-mv3/manifest.json");

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export default async function globalSetup() {
  loadEnvFile(path.join(extensionRoot, ".env.development"));
  loadEnvFile(path.join(extensionRoot, ".env.production"));

  if (existsSync(manifestPath)) {
    return;
  }

  execSync("pnpm exec wxt build", {
    cwd: extensionRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_CLERK_PUBLISHABLE_KEY:
        process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "pk_test_e2e_build_only",
      VITE_SYNC_HOST: process.env.VITE_SYNC_HOST ?? "http://localhost:3000",
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? "http://localhost:3000",
      VITE_CLERK_FRONTEND_API:
        process.env.VITE_CLERK_FRONTEND_API ?? "https://placeholder.clerk.accounts.dev",
    },
  });
}
