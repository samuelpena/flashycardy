import { createFlashycardyClient, type FlashycardyClientOptions } from "./client";
import { createCardsApi } from "./cards";
import { createDecksApi } from "./decks";
import { createStudySessionsApi } from "./study-sessions";

export { ApiError } from "./errors";
export { createFlashycardyClient, type FlashycardyClient, type FlashycardyClientOptions } from "./client";
export * from "./types";
export { createDecksApi, createCardsApi, createStudySessionsApi };

/**
 * Factory for the full FlashyCardy REST client (decks, cards, study sessions).
 */
export function createFlashycardyApi(options: FlashycardyClientOptions) {
  const client = createFlashycardyClient(options);
  return {
    client,
    decks: createDecksApi(client),
    cards: createCardsApi(client),
    studySessions: createStudySessionsApi(client),
  };
}

export type FlashycardyApi = ReturnType<typeof createFlashycardyApi>;
