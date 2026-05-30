"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/chrome-extension";
import type { Deck } from "@flashycardy/api-client";
import { AddCardForm } from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@flashycardy/ui/button";
import { Label } from "@flashycardy/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flashycardy/ui/select";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { PREFILL_FRONT_KEY } from "@/lib/storage-keys";

export function NewCardScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const t = useTranslations("Extension");
  const tAdd = useTranslations("AddCard");
  const tActions = useTranslations("Actions");
  const tExt = useTranslations("Extension");

  const [prefillFront, setPrefillFront] = useState("");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckUuid, setDeckUuid] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadDecks = useCallback(async () => {
    const all = await fetchAllPages((p) => api.decks.list(p));
    setDecks(all);
    if (all.length > 0) {
      setDeckUuid((current) => current || all[0].uuid);
    }
  }, [api]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await chrome.storage.session.get(PREFILL_FRONT_KEY);
      const front = stored[PREFILL_FRONT_KEY];
      if (typeof front === "string" && front.trim()) {
        setPrefillFront(front.trim());
        await chrome.storage.session.remove(PREFILL_FRONT_KEY);
      }

      if (isSignedIn) {
        try {
          await loadDecks();
        } catch {
          /* decks stay empty */
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, loadDecks]);

  if (!isLoaded || loading) {
    return <p className="text-sm text-muted-foreground">{tExt("loading")}</p>;
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("signInToSave")}</p>
        <Button variant="secondary" nativeButton={false} render={<Link to="/" />}>
          {t("openFlashycardy")}
        </Button>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Link
          to="/dashboard"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Dashboard
        </Link>
        <p className="text-sm text-muted-foreground">{t("noDecksForSave")}</p>
        <Button nativeButton={false} render={<Link to="/dashboard" />}>
          {t("createDeckFirst")}
        </Button>
      </div>
    );
  }

  const selectedDeck = decks.find((deck) => deck.uuid === deckUuid);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Link
        to="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Dashboard
      </Link>
      <h1 className="text-lg font-semibold text-foreground">{t("saveSelectionTitle")}</h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="deck-select">{t("selectDeck")}</Label>
        <Select value={deckUuid} onValueChange={(v) => v && setDeckUuid(v)}>
          <SelectTrigger id="deck-select" className="w-full">
            <SelectValue>{selectedDeck?.name ?? t("selectDeck")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {decks.map((deck) => (
              <SelectItem key={deck.uuid} value={deck.uuid}>
                {deck.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <AddCardForm
        prefillFront={prefillFront}
        submitLabel={tAdd("triggerDefault")}
        onSubmit={async (input) => {
          try {
            await api.cards.create(deckUuid, input);
            return {};
          } catch (err) {
            return { error: mapApiErrorToMessage(err, tActions) };
          }
        }}
        onSuccess={() => navigate(`/decks/${deckUuid}`)}
      />
    </div>
  );
}
