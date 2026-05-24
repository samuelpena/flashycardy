"use client";

import { EditDeckDialog as EditDeckDialogBase } from "@flashycardy/features";
import { updateDeckAction } from "@/actions/decks";

type EditDeckDialogProps = {
  deckUuid: string;
  initialName: string;
  initialDescription: string | null;
};

export function EditDeckDialog(props: EditDeckDialogProps) {
  return (
    <EditDeckDialogBase
      {...props}
      triggerVariant="outline"
      onSubmit={(input) => updateDeckAction(input)}
    />
  );
}
