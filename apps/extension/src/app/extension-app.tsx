import { HashRouter } from "react-router-dom";
import { ExtensionProviders } from "@/app/providers";
import { ExtensionRouter } from "@/app/router";

export function ExtensionApp() {
  return (
    <HashRouter>
      <ExtensionProviders>
        <ExtensionRouter />
      </ExtensionProviders>
    </HashRouter>
  );
}
