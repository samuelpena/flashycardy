"use client";

import { useState, useTransition } from "react";
import { SparklesIcon, LoaderIcon } from "lucide-react";
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
            : "Failed to generate cards."
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
            Generate with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Add a description to your deck first so AI can generate relevant cards.
        </TooltipContent>
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
        {isPending ? "Generating…" : "Generate with AI"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
