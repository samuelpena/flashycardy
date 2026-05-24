"use client";

import { DeleteCardDialog as DeleteCardDialogBase } from "@flashycardy/features";
import { deleteCardAction } from "@/actions/cards";

type DeleteCardDialogProps = {
  cardUuid: string;
  deckUuid: string;
};

export function DeleteCardDialog(props: DeleteCardDialogProps) {
  return <DeleteCardDialogBase {...props} onDelete={(input) => deleteCardAction(input)} />;
}
