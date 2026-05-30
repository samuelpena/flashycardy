"use client";

import { useEffect, useState } from "react";
import type { Card } from "@flashycardy/api-client";
import { StudySession } from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";

export function StudyScreen() {
  const { deckUuid = "" } = useParams<{ deckUuid: string }>();
  const api = useApi();
  const t = useTranslations("StudyPage");
  const tActions = useTranslations("Actions");
  const tStudy = useTranslations("StudyClient");
  const tCommon = useTranslations("Common");
  const tExt = useTranslations("Extension");
  const [cards, setCards] = useState<Card[]>([]);
  const [deckName, setDeckName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckUuid) return;
    let cancelled = false;

    void (async () => {
      try {
        const first = await api.decks.get(deckUuid, { page: 1, pageSize: 100 });
        let allCards = first.data.cards;
        if (first.meta.total_pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: first.meta.total_pages - 1 }, (_, i) =>
              api.decks.get(deckUuid, { page: i + 2, pageSize: 100 }),
            ),
          );
          allCards = allCards.concat(...rest.map((r) => r.data.cards));
        }
        if (!cancelled) {
          setDeckName(first.data.name);
          setCards(allCards);
        }
      } catch {
        if (!cancelled) setError(tCommon("tryAgain"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, deckUuid, tCommon]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">{tExt("loading")}</p>;
  }

  if (error || cards.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          to={`/decks/${deckUuid}`}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("backToDeck", { name: deckName || "…" })}
        </Link>
        <p className="text-sm text-muted-foreground">
          {cards.length === 0 ? tStudy("emptyTitle") : error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Link
        to={`/decks/${deckUuid}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        {t("backToDeck", { name: deckName })}
      </Link>
      <h1 className="text-xl font-semibold text-foreground">{t("title", { name: deckName })}</h1>
      <StudySession
        deckUuid={deckUuid}
        cards={cards.map((c) => ({ uuid: c.uuid, front: c.front, back: c.back }))}
        onSaveSession={async (input) => {
          try {
            await api.studySessions.create(input);
            return {};
          } catch (err) {
            return { error: mapApiErrorToMessage(err, tActions) };
          }
        }}
      />
    </div>
  );
}
