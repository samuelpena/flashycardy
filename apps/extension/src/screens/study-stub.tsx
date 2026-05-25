import { useTranslations } from "next-intl";
import { useParams } from "react-router-dom";

export function StudyStubScreen() {
  const t = useTranslations("Extension");
  const { deckUuid } = useParams<{ deckUuid: string }>();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Study</h2>
      <p className="text-sm text-muted-foreground">{t("studyPlaceholder")}</p>
      <p className="font-mono text-xs text-muted-foreground">{deckUuid}</p>
    </div>
  );
}
