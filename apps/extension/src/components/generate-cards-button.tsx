"use client";

import { useState, useTransition } from "react";
import { Protect } from "@clerk/chrome-extension";
import { SparklesIcon, LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@flashycardy/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@flashycardy/ui/tooltip";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";
import { openPricingTab } from "@/lib/open-pricing";

type GenerateCardsButtonProps = {
  deckUuid: string;
  hasDescription: boolean;
  onGenerated?: () => void;
};

function GenerateCardsButtonInner({
  deckUuid,
  hasDescription,
  onGenerated,
}: GenerateCardsButtonProps) {
  const api = useApi();
  const tDeck = useTranslations("DeckDetail");
  const t = useTranslations("GenerateCards");
  const tActions = useTranslations("Actions");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await api.decks.generateCards(deckUuid);
        onGenerated?.();
      } catch (err) {
        setError(mapApiErrorToMessage(err, tActions));
      }
    });
  }

  if (!hasDescription) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button variant="secondary" disabled>
            <SparklesIcon className="size-4" />
            {tDeck("generateWithAI")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("tooltipNeedDescription")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" onClick={handleClick} disabled={isPending}>
        {isPending ? (
          <LoaderIcon className="size-4 animate-spin" />
        ) : (
          <SparklesIcon className="size-4" />
        )}
        {isPending ? t("generating") : tDeck("generateWithAI")}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function GenerateCardsButton(props: GenerateCardsButtonProps) {
  const tDeck = useTranslations("DeckDetail");

  return (
    <Protect
      feature="ai_flashcard_generation"
      fallback={
        <Button variant="secondary" onClick={() => openPricingTab()}>
          <SparklesIcon className="size-4" />
          {tDeck("generateWithAI")}
        </Button>
      }
    >
      <GenerateCardsButtonInner {...props} />
    </Protect>
  );
}
