import { useTranslations } from "next-intl";
import { useParams } from "react-router-dom";

export function DeckDetailStubScreen() {
  const t = useTranslations("Extension");
  const { deckUuid } = useParams<{ deckUuid: string }>();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">Deck</h2>
      <p className="text-sm text-muted-foreground">{t("deckPlaceholder")}</p>
      <p className="font-mono text-xs text-muted-foreground">{deckUuid}</p>
    </div>
  );
}
