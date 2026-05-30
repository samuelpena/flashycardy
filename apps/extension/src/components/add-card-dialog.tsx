"use client";

import { AddCardDialog as AddCardDialogBase } from "@flashycardy/features";
import type { AddCardFormInput } from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";

type AddCardDialogProps = {
  deckUuid: string;
  trigger?: React.ReactNode;
  onAdded?: () => void;
};

export function AddCardDialog({ deckUuid, trigger, onAdded }: AddCardDialogProps) {
  const api = useApi();
  const tActions = useTranslations("Actions");

  async function handleSubmit(input: AddCardFormInput) {
    try {
      await api.cards.create(deckUuid, input);
      onAdded?.();
      return {};
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  return (
    <AddCardDialogBase trigger={trigger} onSubmit={handleSubmit} />
  );
}
