"use client";

import { useRouter } from "next/navigation";
import {
  CreateDeckDialog as CreateDeckDialogBase,
  type CreateDeckFromDocumentInput,
  type CreateDeckInput,
} from "@flashycardy/features";
import { createDeckAction, createDeckFromDocumentAction } from "@/actions/decks";

type CreateDeckDialogProps = Omit<
  React.ComponentProps<typeof CreateDeckDialogBase>,
  "onCreate" | "onCreateFromDocument" | "onDeckCreated"
> & {
  canGenerateDeckFromDocument?: boolean;
};

export function CreateDeckDialog({
  canGenerateDeckFromDocument = false,
  ...props
}: CreateDeckDialogProps) {
  const router = useRouter();

  return (
    <CreateDeckDialogBase
      {...props}
      canGenerateDeckFromDocument={canGenerateDeckFromDocument}
      onCreate={(input: CreateDeckInput) => createDeckAction(input)}
      onCreateFromDocument={
        canGenerateDeckFromDocument
          ? (input: CreateDeckFromDocumentInput) => createDeckFromDocumentAction(input)
          : undefined
      }
      onDeckCreated={(deckUuid) => router.push(`/decks/${deckUuid}`)}
    />
  );
}
