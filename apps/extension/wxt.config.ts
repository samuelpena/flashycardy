import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

function hostPermissionPattern(origin: string | undefined): string | null {
  if (!origin?.trim()) return null;
  const normalized = origin.replace(/\/$/, "");
  return `${normalized}/*`;
}

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  outDir: ".output",
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: () => {
    const syncHost = process.env.VITE_SYNC_HOST ?? "http://localhost:3000";
    const apiBase = process.env.VITE_API_BASE_URL ?? syncHost;
    const clerkFrontend = process.env.VITE_CLERK_FRONTEND_API;

    const hostPermissions = [
      hostPermissionPattern(syncHost),
      hostPermissionPattern(apiBase),
      clerkFrontend
        ? `${clerkFrontend.replace(/\/$/, "")}/*`
        : "https://*.clerk.accounts.dev/*",
    ].filter((value): value is string => value != null);

    return {
      name: "FlashyCardy",
      description: "Study flashcards from any page.",
      permissions: [
        "storage",
        "sidePanel",
        "activeTab",
        "scripting",
        "contextMenus",
      ],
      host_permissions: hostPermissions,
      side_panel: {
        default_path: "sidepanel.html",
      },
      action: {
        default_title: "FlashyCardy",
      },
    };
  },
});
