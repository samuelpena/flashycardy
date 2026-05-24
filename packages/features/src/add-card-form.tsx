"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@flashycardy/ui/button";
import { Input } from "@flashycardy/ui/input";
import { Label } from "@flashycardy/ui/label";
import { getActionErrorMessage, type ActionError } from "./types";

export type AddCardFormInput = {
  front: string;
  back: string;
};

export type AddCardFormProps = {
  prefillFront?: string;
  onSubmit: (input: AddCardFormInput) => Promise<{ error?: ActionError } | void>;
  onSuccess?: () => void;
  submitLabel?: string;
  pendingLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
};

/**
 * Controlled flashcard create form (front/back). Used in dialogs and extension routes.
 */
export function AddCardForm({
  prefillFront = "",
  onSubmit,
  onSuccess,
  submitLabel,
  pendingLabel,
  showCancel = false,
  onCancel,
}: AddCardFormProps) {
  const t = useTranslations("AddCard");
  const tCommon = useTranslations("Common");
  const [front, setFront] = useState(prefillFront);
  const [back, setBack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFront(prefillFront);
  }, [prefillFront]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await onSubmit({ front, back });
      if (result?.error) {
        setError(getActionErrorMessage(result.error, tCommon("checkForm")));
        return;
      }
      setFront(prefillFront);
      setBack("");
      onSuccess?.();
    });
  }

  return (
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

      <div className="flex justify-end gap-2">
        {showCancel && onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? (pendingLabel ?? t("creating")) : (submitLabel ?? t("createCard"))}
        </Button>
      </div>
    </form>
  );
}
