"use client";

import { EditDeckDialog as EditDeckDialogBase, type EditDeckInput } from "@flashycardy/features";
import { useTranslations } from "next-intl";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";

type EditDeckDialogProps = {
  deckUuid: string;
  initialName: string;
  initialDescription: string | null;
  triggerVariant?: "icon" | "outline";
  onUpdated?: () => void;
};

export function EditDeckDialog(props: EditDeckDialogProps) {
  const { onUpdated, ...rest } = props;
  const api = useApi();
  const tActions = useTranslations("Actions");

  async function handleSubmit(input: EditDeckInput) {
    try {
      await api.decks.patch(input.deckUuid, {
        name: input.name,
        description: input.description ?? null,
      });
      onUpdated?.();
      return {};
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  return <EditDeckDialogBase {...rest} onSubmit={handleSubmit} />;
}
