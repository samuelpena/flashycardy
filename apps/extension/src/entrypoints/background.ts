import { createClerkClient } from "@clerk/chrome-extension/background";

export default defineBackground(() => {
  void createClerkClient({
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  });

  chrome.runtime.onInstalled.addListener(() => {
    void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    chrome.contextMenus.create({
      id: "flashycardy-save-selection",
      title: "Save selection to FlashyCardy",
      contexts: ["selection"],
    });
  });
});
