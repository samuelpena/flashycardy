"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCardAction } from "@/actions/cards";

interface EditCardDialogProps {
  cardUuid: string;
  deckUuid: string;
  initialFront: string;
  initialBack: string;
}

export function EditCardDialog({
  cardUuid,
  deckUuid,
  initialFront,
  initialBack,
}: EditCardDialogProps) {
  const t = useTranslations("EditCard");
  const tCommon = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFront(initialFront);
      setBack(initialBack);
      setError(null);
    }
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateCardAction({ cardUuid, deckUuid, front, back });

      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : tCommon("checkForm"),
        );
        return;
      }

      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setOpen(true)}
      >
        <PencilIcon className="size-3.5" />
        <span className="sr-only">{t("editSrOnly")}</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-card-front">{tCommon("front")}</Label>
              <Input
                id="edit-card-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={t("frontPlaceholder")}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-card-back">{tCommon("back")}</Label>
              <Input
                id="edit-card-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder={t("backPlaceholder")}
                required
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? tCommon("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
