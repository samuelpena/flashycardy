"use client";

import {
  DeleteDeckDialog as DeleteDeckDialogBase,
  type DeleteDeckInput,
} from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { useNavigate } from "react-router-dom";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";

type DeleteDeckDialogProps = {
  deckUuid: string;
  deckName: string;
  cardCount: number;
  triggerVariant?: "icon" | "outline";
  redirectAfterDelete?: boolean;
  onDeleted?: () => void;
};

export function DeleteDeckDialog({
  redirectAfterDelete = false,
  onDeleted,
  ...props
}: DeleteDeckDialogProps) {
  const api = useApi();
  const navigate = useNavigate();
  const tActions = useTranslations("Actions");

  async function handleDelete(input: DeleteDeckInput) {
    try {
      await api.decks.delete(input.deckUuid);
      onDeleted?.();
      if (redirectAfterDelete) navigate("/dashboard");
      return {};
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  return <DeleteDeckDialogBase {...props} onDelete={handleDelete} />;
}
