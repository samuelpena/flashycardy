import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { getSidepanelUrl } from "@/lib/extension-url";

function PopupLauncher() {
  useEffect(() => {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.windowId != null) {
        try {
          await chrome.sidePanel.open({ windowId: tab.windowId });
          window.close();
          return;
        } catch {
          /* fall through */
        }
      }
      await chrome.tabs.create({ url: getSidepanelUrl() });
      window.close();
    })();
  }, []);

  return (
    <p className="p-4 text-sm text-muted-foreground">Opening FlashyCardy…</p>
  );
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <PopupLauncher />
  </StrictMode>,
);
