"use client";

import { AddCardDialog as AddCardDialogBase } from "@flashycardy/features";
import { createCardAction } from "@/actions/cards";

type AddCardDialogProps = {
  deckUuid: string;
  trigger?: React.ReactNode;
};

export function AddCardDialog({ deckUuid, trigger }: AddCardDialogProps) {
  return (
    <AddCardDialogBase
      trigger={trigger}
      onSubmit={(input) => createCardAction({ deckUuid, ...input })}
    />
  );
}
