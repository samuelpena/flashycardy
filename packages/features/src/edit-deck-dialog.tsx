"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@flashycardy/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@flashycardy/ui/dialog";
import { Input } from "@flashycardy/ui/input";
import { Label } from "@flashycardy/ui/label";
import { Textarea } from "@flashycardy/ui/textarea";
import { getActionErrorMessage, type ActionError } from "./types";

export type EditDeckInput = {
  deckUuid: string;
  name: string;
  description?: string;
};

export type EditDeckDialogProps = {
  deckUuid: string;
  initialName: string;
  initialDescription: string | null;
  triggerVariant?: "icon" | "outline";
  onSubmit: (input: EditDeckInput) => Promise<{ error?: ActionError } | void>;
};

export function EditDeckDialog({
  deckUuid,
  initialName,
  initialDescription,
  triggerVariant = "icon",
  onSubmit,
}: EditDeckDialogProps) {
  const t = useTranslations("EditDeck");
  const tPage = useTranslations("EditDeckPage");
  const tCommon = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const descriptionPlaceholder =
    triggerVariant === "outline"
      ? tPage("descriptionPlaceholder")
      : t("descriptionPlaceholder");

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName(initialName);
      setDescription(initialDescription ?? "");
      setError(null);
    }
    setOpen(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await onSubmit({
        deckUuid,
        name,
        description: description || undefined,
      });

      if (result?.error) {
        setError(getActionErrorMessage(result.error, tCommon("checkForm")));
        return;
      }

      setOpen(false);
    });
  }

  const trigger =
    triggerVariant === "outline" ? (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <PencilIcon className="size-4" />
        {tCommon("edit")}
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={() => setOpen(true)}
        aria-label={t("editAria")}
      >
        <PencilIcon className="size-3.5" />
        <span className="sr-only">{t("editSrOnly")}</span>
      </Button>
    );

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            {triggerVariant === "icon" ? (
              <DialogDescription>{t("description")}</DialogDescription>
            ) : null}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-deck-name">{tCommon("name")}</Label>
              <Input
                id="edit-deck-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-deck-description">
                {tCommon("description")}{" "}
                {triggerVariant === "outline" ? (
                  <span className="text-muted-foreground font-normal">
                    {tPage("descriptionOptional")}
                  </span>
                ) : null}
              </Label>
              <Textarea
                id="edit-deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={descriptionPlaceholder}
                rows={3}
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
