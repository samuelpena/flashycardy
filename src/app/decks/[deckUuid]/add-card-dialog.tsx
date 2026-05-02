"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
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
import { createCardAction } from "@/actions/cards";

interface AddCardDialogProps {
  deckUuid: string;
  trigger?: React.ReactNode;
}

export function AddCardDialog({ deckUuid, trigger }: AddCardDialogProps) {
  const t = useTranslations("AddCard");
  const tCommon = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFront("");
      setBack("");
      setError(null);
    }
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createCardAction({ deckUuid, front, back });

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
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button>
            <PlusIcon className="size-4" />
            {t("triggerDefault")}
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-front">{tCommon("front")}</Label>
              <Input
                id="card-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={t("frontPlaceholder")}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="card-back">{tCommon("back")}</Label>
              <Input
                id="card-back"
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
                {isPending ? t("creating") : t("createCard")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
