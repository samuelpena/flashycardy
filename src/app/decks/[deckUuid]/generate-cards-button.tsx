"use client";

import { useState, useTransition } from "react";
import { SparklesIcon, LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { generateCardsAction } from "@/actions/cards";

interface GenerateCardsButtonProps {
  deckUuid: string;
  hasDescription: boolean;
}

export function GenerateCardsButton({
  deckUuid,
  hasDescription,
}: GenerateCardsButtonProps) {
  const tDeck = useTranslations("DeckDetail");
  const t = useTranslations("GenerateCards");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await generateCardsAction({ deckUuid });
      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : t("failedGeneric"),
        );
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
      <Button
        variant="secondary"
        onClick={handleClick}
        disabled={isPending}
      >
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
