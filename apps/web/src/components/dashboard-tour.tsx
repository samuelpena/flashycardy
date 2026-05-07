"use client";

import { useEffect, useState } from "react";
import { Joyride, type EventData, STATUS } from "react-joyride";
import { useTranslations } from "next-intl";

const TOUR_STORAGE_KEY = "flashycardy_tour_seen";

export function DashboardTour() {
  const t = useTranslations("DashboardTour");
  const [run, setRun] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!seen) {
      setRun(true);
    }
  }, []);

  function handleEvent(data: EventData) {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      setRun(false);
    }
  }

  return (
    <Joyride
      steps={[
        {
          target: "#new-deck-btn",
          title: t("step1Title"),
          content: t("step1Content"),
          skipBeacon: true,
          placement: "bottom",
        },
      ]}
      run={run}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: "hsl(265 89% 78%)",
        zIndex: 10000,
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
      }}
      styles={{
        tooltip: { borderRadius: 8 },
      }}
    />
  );
}
