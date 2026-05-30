import { HashRouter } from "react-router-dom";
import { ApiProvider } from "@/lib/api-provider";
import { ExtensionProviders } from "@/app/providers";
import { ExtensionRouter } from "@/app/router";

export function ExtensionApp() {
  return (
    <HashRouter>
      <ExtensionProviders>
        <ApiProvider>
          <ExtensionRouter />
        </ApiProvider>
      </ExtensionProviders>
    </HashRouter>
  );
}
