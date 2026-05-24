import type { FlashycardyClient } from "./client";
import type { CreateStudySessionInput, PaginationParams, StudySessionCountByDeck } from "./types";

export function createStudySessionsApi(client: FlashycardyClient) {
  return {
    list(pagination?: PaginationParams) {
      return client.requestPaginated<Record<string, unknown>>("/api/study-sessions", pagination);
    },

    create(input: CreateStudySessionInput) {
      return client.requestData<Record<string, unknown>>("/api/study-sessions", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    listCountsByDeck(pagination?: PaginationParams) {
      return client.requestPaginated<StudySessionCountByDeck>(
        "/api/study-sessions/counts",
        pagination,
      );
    },
  };
}
