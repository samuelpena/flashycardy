import { getExtensionEnv } from "@/lib/env";

export function getPricingUrl(): string {
  const { syncHost, apiBaseUrl } = getExtensionEnv();
  const base = (syncHost ?? apiBaseUrl).replace(/\/$/, "");
  return `${base}/pricing`;
}

export function openPricingTab(): void {
  void chrome.tabs.create({ url: getPricingUrl() });
}
