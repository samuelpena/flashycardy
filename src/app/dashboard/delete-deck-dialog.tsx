"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDeckAction } from "@/actions/decks";

interface DeleteDeckDialogProps {
  deckId: number;
  deckName: string;
  cardCount: number;
}

export function DeleteDeckDialog({
  deckId,
  deckName,
  cardCount,
}: DeleteDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    setOpen(next);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDeckAction({ deckId });
      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Something went wrong. Try again.",
        );
        return;
      }
      setOpen(false);
    });
  }

  const cardsPhrase =
    cardCount === 0
      ? "There are no cards in this deck."
      : cardCount === 1
        ? "The 1 card in this deck will be permanently deleted."
        : `All ${cardCount} cards in this deck will be permanently deleted.`;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => handleOpenChange(true)}
        aria-label="Delete deck"
      >
        <Trash2Icon className="size-3.5" />
        <span className="sr-only">Delete deck</span>
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`Delete "${deckName}"?`}</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The deck will be removed from your
              library. {cardsPhrase}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-center text-sm font-medium text-destructive sm:text-left">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting…" : "Delete deck"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
