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
}

export function GenerateCardsButton({
  deckId,
  hasAiFeature,
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

  if (!hasAiFeature) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="secondary" onClick={handleClick}>
              <SparklesIcon className="size-4" />
              Generate with AI
            </Button>
          }
        />
        <TooltipContent>
          This is a Pro feature. Click to view plans.
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
