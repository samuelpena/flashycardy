"use client";

import { useAuth } from "@clerk/chrome-extension";
import { createFlashycardyApi, type FlashycardyApi } from "@flashycardy/api-client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getExtensionEnv } from "@/lib/env";

const ApiContext = createContext<FlashycardyApi | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const env = getExtensionEnv();

  const api = useMemo(
    () =>
      createFlashycardyApi({
        baseUrl: env.apiBaseUrl,
        getToken: () => getToken(),
      }),
    [env.apiBaseUrl, getToken],
  );

  if (!isLoaded) {
    return null;
  }

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): FlashycardyApi {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return api;
}
