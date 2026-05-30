"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PENDING_ROUTE_KEY } from "@/lib/storage-keys";

/**
 * Navigates when the background worker sets a pending hash route (e.g. context menu save).
 */
export function PendingRouteListener() {
  const navigate = useNavigate();

  useEffect(() => {
    async function consumePendingRoute() {
      const stored = await chrome.storage.session.get(PENDING_ROUTE_KEY);
      const route = stored[PENDING_ROUTE_KEY];
      if (typeof route === "string" && route.startsWith("/")) {
        await chrome.storage.session.remove(PENDING_ROUTE_KEY);
        navigate(route);
      }
    }

    void consumePendingRoute();

    function onChanged(
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName !== "session" || !(PENDING_ROUTE_KEY in changes)) return;
      const route = changes[PENDING_ROUTE_KEY].newValue;
      if (typeof route === "string" && route.startsWith("/")) {
        void chrome.storage.session.remove(PENDING_ROUTE_KEY);
        navigate(route);
      }
    }

    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [navigate]);

  return null;
}
