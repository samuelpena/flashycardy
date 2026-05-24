import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import * as study from "@/db/queries/study-sessions";
import { runListRatings } from "./list-ratings";

vi.mock("@/db/queries/decks", () => ({
  getDeckMetadataByUuidAndUser: vi.fn(),
}));
vi.mock("@/db/queries/study-sessions", () => ({
  getCardRatingsByDeck: vi.fn(),
  getCardRatingsCountByDeck: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };
const deckUuid = "550e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  vi.clearAllMocks();
});

describe("runListRatings", () => {
  test("returns ratings when deck exists", async () => {
    vi.mocked(decks.getDeckMetadataByUuidAndUser).mockResolvedValue({ uuid: deckUuid } as never);
    vi.mocked(study.getCardRatingsByDeck).mockResolvedValue([
      { cardUuid: "660e8400-e29b-41d4-a716-446655440000", correctCount: 1, incorrectCount: 0 },
    ] as never);
    vi.mocked(study.getCardRatingsCountByDeck).mockResolvedValue(1);
    const out = await runListRatings(ctx, { deckUuid, page: 1, pageSize: 20 });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data).toHaveLength(1);
  });

  test("errors when deck not found", async () => {
    vi.mocked(decks.getDeckMetadataByUuidAndUser).mockResolvedValue(undefined);
    const out = await runListRatings(ctx, { deckUuid, page: 1, pageSize: 20 });
    expect(out.isError).toBe(true);
    expect(study.getCardRatingsByDeck).not.toHaveBeenCalled();
  });
});
