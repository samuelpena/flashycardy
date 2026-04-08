"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SparklesIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { generateCardsAction } from "@/actions/cards";

interface GenerateCardsButtonProps {
  deckId: number;
  hasAiFeature: boolean;
  hasDescription: boolean;
}

export function GenerateCardsButton({
  deckId,
  hasAiFeature,
  hasDescription,
}: GenerateCardsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!hasAiFeature) {
      router.push("/pricing");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await generateCardsAction({ deckId });
      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to generate cards."
        );
      }
    });
  }

  const tooltipMessage = !hasAiFeature
    ? "This is a Pro feature. Click to view plans."
    : !hasDescription
      ? "Add a description to your deck first so AI can generate relevant cards."
      : null;

  if (tooltipMessage) {
    const isDisabled = hasAiFeature && !hasDescription;

    return (
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button
            variant="secondary"
            onClick={!hasAiFeature ? handleClick : undefined}
            disabled={isDisabled}
          >
            <SparklesIcon className="size-4" />
            Generate with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipMessage}</TooltipContent>
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
