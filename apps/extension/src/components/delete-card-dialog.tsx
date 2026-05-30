"use client";

import {
  DeleteCardDialog as DeleteCardDialogBase,
  type DeleteCardInput,
} from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";

type DeleteCardDialogProps = {
  cardUuid: string;
  deckUuid: string;
  onDeleted?: () => void;
};

export function DeleteCardDialog({ onDeleted, ...props }: DeleteCardDialogProps) {
  const api = useApi();
  const tActions = useTranslations("Actions");

  async function handleDelete(input: DeleteCardInput) {
    try {
      await api.cards.delete(input.deckUuid, input.cardUuid);
      onDeleted?.();
      return {};
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  return <DeleteCardDialogBase {...props} onDelete={handleDelete} />;
}
