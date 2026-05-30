import { createClerkClient } from "@clerk/chrome-extension/background";
import { PENDING_ROUTE_KEY, PREFILL_FRONT_KEY } from "@/lib/storage-keys";

const CONTEXT_MENU_ID = "flashycardy-save-selection";
const CONTEXT_MENU_TITLE = "Save selection to FlashyCardy";

export default defineBackground(() => {
  void createClerkClient({
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  });

  chrome.runtime.onInstalled.addListener(() => {
    void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: CONTEXT_MENU_TITLE,
      contexts: ["selection"],
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID) return;
    const selectionText = info.selectionText?.trim();
    if (!selectionText) return;

    void (async () => {
      await chrome.storage.session.set({
        [PREFILL_FRONT_KEY]: selectionText,
        [PENDING_ROUTE_KEY]: "/decks/new-card",
      });

      if (tab?.windowId != null) {
        try {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        } catch {
          /* panel may already be open */
        }
      }
    })();
  });
});
