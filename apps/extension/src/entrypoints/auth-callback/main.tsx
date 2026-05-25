import {
  AuthenticateWithRedirectCallback,
  ClerkProvider,
} from "@clerk/chrome-extension";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getExtensionEnv } from "@/lib/env";
import { getAuthCallbackUrl, getSidepanelUrl } from "@/lib/extension-url";
import "@/styles/app.css";

document.documentElement.classList.add("dark");

function AuthCallbackApp() {
  const env = getExtensionEnv();

  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      syncHost={env.syncHost}
      afterSignOutUrl={getSidepanelUrl()}
      signInFallbackRedirectUrl={getAuthCallbackUrl()}
      signUpFallbackRedirectUrl={getAuthCallbackUrl()}
    >
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl={getSidepanelUrl("/dashboard")}
        signUpForceRedirectUrl={getSidepanelUrl("/dashboard")}
      />
    </ClerkProvider>
  );
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <AuthCallbackApp />
  </StrictMode>,
);
