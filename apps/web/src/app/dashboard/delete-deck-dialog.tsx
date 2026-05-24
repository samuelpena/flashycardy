"use client";

import { DeleteDeckDialog as DeleteDeckDialogBase } from "@flashycardy/features";
import { deleteDeckAction } from "@/actions/decks";

type DeleteDeckDialogProps = {
  deckUuid: string;
  deckName: string;
  cardCount: number;
};

export function DeleteDeckDialog(props: DeleteDeckDialogProps) {
  return (
    <DeleteDeckDialogBase
      {...props}
      triggerVariant="icon"
      onDelete={(input) => deleteDeckAction(input)}
    />
  );
}
