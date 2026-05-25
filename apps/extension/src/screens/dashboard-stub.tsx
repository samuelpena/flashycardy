import { useTranslations } from "next-intl";

export function DashboardStubScreen() {
  const t = useTranslations("Extension");

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
      <p className="text-sm text-muted-foreground">{t("dashboardPlaceholder")}</p>
    </div>
  );
}
