"use client";

import {
  CreateDeckDialog as CreateDeckDialogBase,
  type CreateDeckFromDocumentInput,
  type CreateDeckInput,
} from "@flashycardy/features";
import { Protect } from "@clerk/chrome-extension";
import { useTranslations } from "next-intl";
import { useNavigate } from "react-router-dom";
import { mapApiErrorToMessage } from "@/lib/api-error-message";
import { useApi } from "@/lib/api-provider";
import { getPricingUrl } from "@/lib/open-pricing";

const FREE_DECK_LIMIT = 3;

type CreateDeckDialogInnerProps = {
  limitReached: boolean;
  canGenerateDeckFromDocument: boolean;
  triggerId?: string;
  emptyStateTrigger?: boolean;
  onCreated?: () => void;
};

function CreateDeckDialogInner({
  limitReached,
  canGenerateDeckFromDocument,
  triggerId,
  emptyStateTrigger,
  onCreated,
}: CreateDeckDialogInnerProps) {
  const api = useApi();
  const navigate = useNavigate();
  const tActions = useTranslations("Actions");

  async function handleCreate(input: CreateDeckInput) {
    try {
      await api.decks.create(input);
      onCreated?.();
      return {};
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  async function handleCreateFromDocument(input: CreateDeckFromDocumentInput) {
    try {
      const result = await api.decks.createFromDocument(input);
      onCreated?.();
      return { deckUuid: result.deckUuid };
    } catch (error) {
      return { error: mapApiErrorToMessage(error, tActions) };
    }
  }

  return (
    <CreateDeckDialogBase
      limitReached={limitReached}
      triggerId={triggerId}
      emptyStateTrigger={emptyStateTrigger}
      canGenerateDeckFromDocument={canGenerateDeckFromDocument}
      pricingHref={getPricingUrl()}
      onCreate={handleCreate}
      onCreateFromDocument={
        canGenerateDeckFromDocument ? handleCreateFromDocument : undefined
      }
      onDeckCreated={(deckUuid) => navigate(`/decks/${deckUuid}`)}
    />
  );
}

type CreateDeckDialogProps = {
  deckCount?: number;
  triggerId?: string;
  emptyStateTrigger?: boolean;
  onCreated?: () => void;
};

export function CreateDeckDialog({
  deckCount = 0,
  triggerId,
  emptyStateTrigger,
  onCreated,
}: CreateDeckDialogProps) {
  const atLimit = deckCount >= FREE_DECK_LIMIT;

  return (
    <Protect
      feature="unlimited_decks"
      fallback={
        <CreateDeckDialogInner
          limitReached={atLimit}
          canGenerateDeckFromDocument={false}
          triggerId={triggerId}
          emptyStateTrigger={emptyStateTrigger}
          onCreated={onCreated}
        />
      }
    >
      <Protect
        feature="document_deck_generation"
        fallback={
          <CreateDeckDialogInner
            limitReached={false}
            canGenerateDeckFromDocument={false}
            triggerId={triggerId}
            emptyStateTrigger={emptyStateTrigger}
            onCreated={onCreated}
          />
        }
      >
        <CreateDeckDialogInner
          limitReached={false}
          canGenerateDeckFromDocument
          triggerId={triggerId}
          emptyStateTrigger={emptyStateTrigger}
          onCreated={onCreated}
        />
      </Protect>
    </Protect>
  );
}
