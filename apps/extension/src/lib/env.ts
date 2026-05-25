const required = ["VITE_CLERK_PUBLISHABLE_KEY"] as const;

export type ExtensionEnv = {
  clerkPublishableKey: string;
  clerkFrontendApi: string | undefined;
  syncHost: string | undefined;
  apiBaseUrl: string;
};

let cached: ExtensionEnv | null = null;

export function getExtensionEnv(): ExtensionEnv {
  if (cached) return cached;

  for (const key of required) {
    const value = import.meta.env[key];
    if (!value || typeof value !== "string") {
      throw new Error(
        `Missing ${key}. Copy apps/extension/.env.development.example to .env.development.`,
      );
    }
  }

  const syncHost = import.meta.env.VITE_SYNC_HOST as string | undefined;
  const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    syncHost ??
    "http://localhost:3000";

  cached = {
    clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string,
    clerkFrontendApi: import.meta.env.VITE_CLERK_FRONTEND_API as string | undefined,
    syncHost,
    apiBaseUrl,
  };

  return cached;
}
