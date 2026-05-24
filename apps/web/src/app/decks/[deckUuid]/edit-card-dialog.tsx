"use client";

import { EditCardDialog as EditCardDialogBase } from "@flashycardy/features";
import { updateCardAction } from "@/actions/cards";

type EditCardDialogProps = {
  cardUuid: string;
  deckUuid: string;
  initialFront: string;
  initialBack: string;
};

export function EditCardDialog(props: EditCardDialogProps) {
  return <EditCardDialogBase {...props} onSubmit={(input) => updateCardAction(input)} />;
}
