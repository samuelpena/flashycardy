import type { FlashycardyClient } from "./client";
import type {
  CreateDeckFromDocumentInput,
  CreateDeckFromPageInput,
  CreateDeckInput,
  Deck,
  DeckCount,
  DeckWithCards,
  PaginationParams,
  PatchDeckInput,
  ReplaceDeckInput,
} from "./types";

export function createDecksApi(client: FlashycardyClient) {
  return {
    list(pagination?: PaginationParams) {
      return client.requestPaginated<Deck>("/api/decks", pagination);
    },

    count() {
      return client.requestData<DeckCount>("/api/decks/count");
    },

    get(deckUuid: string, pagination?: PaginationParams) {
      return client.requestDataWithPagination<DeckWithCards>(
        `/api/decks/${deckUuid}`,
        pagination,
      );
    },

    create(input: CreateDeckInput) {
      return client.requestData<Deck>("/api/decks", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    replace(deckUuid: string, input: ReplaceDeckInput) {
      return client.requestData<Deck>(`/api/decks/${deckUuid}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
    },

    patch(deckUuid: string, input: PatchDeckInput) {
      return client.requestData<Deck>(`/api/decks/${deckUuid}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    delete(deckUuid: string) {
      return client.requestData<Deck>(`/api/decks/${deckUuid}`, { method: "DELETE" });
    },

    generateCards(deckUuid: string) {
      return client.requestData<{ success: true }>(
        `/api/decks/${deckUuid}/generate-cards`,
        { method: "POST" },
      );
    },

    createFromDocument(input: CreateDeckFromDocumentInput) {
      return client.requestData<{ deckUuid: string }>("/api/decks/from-document", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    /** PR-3 — POST /api/decks/from-page */
    createFromPage(input: CreateDeckFromPageInput) {
      return client.requestData<{ deckUuid: string }>("/api/decks/from-page", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
  };
}
