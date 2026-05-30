"use client";

import { EditCardDialog as EditCardDialogBase, type EditCardInput } from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";

type EditCardDialogProps = {
  cardUuid: string;
  deckUuid: string;
  initialFront: string;
  initialBack: string;
  onUpdated?: () => void;
};

export function EditCardDialog({ onUpdated, ...props }: EditCardDialogProps) {
  const api = useApi();
  const tActions = useTranslations("Actions");

  async function handleSubmit(input: EditCardInput) {
    try {
      await api.cards.patch(input.deckUuid, input.cardUuid, {
        front: input.front,
        back: input.back,
      });
      onUpdated?.();
      return {};
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  return <EditCardDialogBase {...props} onSubmit={handleSubmit} />;
}
