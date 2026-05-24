import type { FlashycardyClient } from "./client";
import type {
  Card,
  CreateCardInput,
  PaginationParams,
  PatchCardInput,
  RatingAggregate,
  ReplaceCardInput,
} from "./types";

export function createCardsApi(client: FlashycardyClient) {
  return {
    list(deckUuid: string, pagination?: PaginationParams) {
      return client.requestPaginated<Card>(`/api/decks/${deckUuid}/cards`, pagination);
    },

    get(deckUuid: string, cardUuid: string) {
      return client.requestData<Card>(`/api/decks/${deckUuid}/cards/${cardUuid}`);
    },

    create(deckUuid: string, input: CreateCardInput) {
      return client.requestData<Card>(`/api/decks/${deckUuid}/cards`, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    replace(deckUuid: string, cardUuid: string, input: ReplaceCardInput) {
      return client.requestData<Card>(`/api/decks/${deckUuid}/cards/${cardUuid}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
    },

    patch(deckUuid: string, cardUuid: string, input: PatchCardInput) {
      return client.requestData<Card>(`/api/decks/${deckUuid}/cards/${cardUuid}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    delete(deckUuid: string, cardUuid: string) {
      return client.requestData<Card>(`/api/decks/${deckUuid}/cards/${cardUuid}`, {
        method: "DELETE",
      });
    },

    listRatings(deckUuid: string, pagination?: PaginationParams) {
      return client.requestPaginated<RatingAggregate>(
        `/api/decks/${deckUuid}/ratings`,
        pagination,
      );
    },
  };
}
