"use client";

import { useRouter } from "next/navigation";
import { DeleteDeckDialog as DeleteDeckDialogBase } from "@flashycardy/features";
import { deleteDeckAction } from "@/actions/decks";

type DeleteDeckDialogProps = {
  deckUuid: string;
  deckName: string;
  cardCount: number;
};

export function DeleteDeckDialog(props: DeleteDeckDialogProps) {
  const router = useRouter();

  return (
    <DeleteDeckDialogBase
      {...props}
      triggerVariant="outline"
      onDelete={(input) => deleteDeckAction(input)}
      onDeleted={() => router.push("/dashboard")}
    />
  );
}
