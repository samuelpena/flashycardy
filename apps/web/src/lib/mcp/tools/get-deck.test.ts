import { afterEach, describe, expect, test, vi } from "vitest";
import * as cards from "@/db/queries/cards";
import * as decks from "@/db/queries/decks";
import { runGetDeck } from "./get-deck";

vi.mock("@/db/queries/decks", () => ({
  getDeckMetadataByUuidAndUser: vi.fn(),
}));
vi.mock("@/db/queries/cards", () => ({
  getCardsByDeckUuidAndUser: vi.fn(),
  getCardCountByDeckUuidAndUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false };
const deckUuid = "550e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  vi.clearAllMocks();
});

describe("runGetDeck", () => {
  test("returns deck with cards when found", async () => {
    vi.mocked(decks.getDeckMetadataByUuidAndUser).mockResolvedValue({
      id: 1,
      uuid: deckUuid,
      name: "D",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Awaited<ReturnType<typeof decks.getDeckMetadataByUuidAndUser>>);
    vi.mocked(cards.getCardsByDeckUuidAndUser).mockResolvedValue({
      status: "success",
      cards: [{ uuid: "660e8400-e29b-41d4-a716-446655440000" } as never],
    });
    vi.mocked(cards.getCardCountByDeckUuidAndUser).mockResolvedValue({
      status: "success",
      count: 1,
    });

    const out = await runGetDeck(ctx, { deckUuid, page: 1, pageSize: 20 });
    expect(out.isError).toBeUndefined();
    const body = JSON.parse(out.content[0].text);
    expect(body.data.cards).toHaveLength(1);
  });

  test("returns error when deck missing for user", async () => {
    vi.mocked(decks.getDeckMetadataByUuidAndUser).mockResolvedValue(undefined);
    const out = await runGetDeck(ctx, { deckUuid, page: 1, pageSize: 20 });
    expect(out.isError).toBe(true);
    expect(cards.getCardsByDeckUuidAndUser).not.toHaveBeenCalled();
  });
});
