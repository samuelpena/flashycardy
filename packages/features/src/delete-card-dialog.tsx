"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@flashycardy/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@flashycardy/ui/alert-dialog";
import type { ActionError } from "./types";

export type DeleteCardInput = {
  cardUuid: string;
  deckUuid: string;
};

export type DeleteCardDialogProps = {
  cardUuid: string;
  deckUuid: string;
  onDelete: (input: DeleteCardInput) => Promise<{ error?: ActionError } | void>;
};

export function DeleteCardDialog({ cardUuid, deckUuid, onDelete }: DeleteCardDialogProps) {
  const t = useTranslations("DeleteCard");
  const tCommon = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onDelete({ cardUuid, deckUuid });
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-3.5" />
        <span className="sr-only">{t("deleteSrOnly")}</span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? t("deleting") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
