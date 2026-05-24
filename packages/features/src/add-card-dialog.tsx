"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@flashycardy/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@flashycardy/ui/dialog";
import { AddCardForm, type AddCardFormInput } from "./add-card-form";
import type { ActionError } from "./types";

export type AddCardDialogProps = {
  trigger?: React.ReactNode;
  prefillFront?: string;
  onSubmit: (input: AddCardFormInput) => Promise<{ error?: ActionError } | void>;
};

export function AddCardDialog({ trigger, prefillFront, onSubmit }: AddCardDialogProps) {
  const t = useTranslations("AddCard");
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
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

          <AddCardForm
            prefillFront={prefillFront}
            onSubmit={onSubmit}
            onSuccess={() => handleOpenChange(false)}
            showCancel
            onCancel={() => handleOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
