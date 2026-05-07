"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
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
  deckUuid: string;
  deckName: string;
  cardCount: number;
}

export function DeleteDeckDialog({
  deckUuid,
  deckName,
  cardCount,
}: DeleteDeckDialogProps) {
  const t = useTranslations("DeleteDeck");
  const tCommon = useTranslations("Common");
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
      const result = await deleteDeckAction({ deckUuid });
      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : tCommon("tryAgain"),
        );
        return;
      }
      setOpen(false);
    });
  }

  const cardsPhrase =
    cardCount === 0
      ? t("cardsNone")
      : cardCount === 1
        ? t("cardsOne")
        : t("cardsMany", { count: cardCount });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => handleOpenChange(true)}
        aria-label={t("deleteAria")}
      >
        <Trash2Icon className="size-3.5" />
        <span className="sr-only">{t("deleteSrOnly")}</span>
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title", { name: deckName })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("description", { cards: cardsPhrase })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-center text-sm font-medium text-destructive sm:text-left">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t("deleting") : t("deleteDeck")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
