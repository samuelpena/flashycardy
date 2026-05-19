import { afterEach, describe, expect, test, vi } from "vitest";
import * as cards from "@/db/queries/cards";
import { runListCards } from "./list-cards";

vi.mock("@/db/queries/cards", () => ({
  getCardsByDeckUuidAndUser: vi.fn(),
  getCardCountByDeckUuidAndUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false };
const deckUuid = "550e8400-e29b-41d4-a716-446655440000";

afterEach(() => {
  vi.clearAllMocks();
});

describe("runListCards", () => {
  test("returns paginated cards", async () => {
    vi.mocked(cards.getCardsByDeckUuidAndUser).mockResolvedValue({
      status: "success",
      cards: [{ uuid: "660e8400-e29b-41d4-a716-446655440000" } as never],
    });
    vi.mocked(cards.getCardCountByDeckUuidAndUser).mockResolvedValue({
      status: "success",
      count: 10,
    });
    const out = await runListCards(ctx, { deckUuid, page: 1, pageSize: 20 });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data).toHaveLength(1);
  });

  test("errors when deck not found", async () => {
    vi.mocked(cards.getCardsByDeckUuidAndUser).mockResolvedValue({ status: "deck-not-found" });
    const out = await runListCards(ctx, { deckUuid, page: 1, pageSize: 20 });
    expect(out.isError).toBe(true);
    expect(cards.getCardCountByDeckUuidAndUser).not.toHaveBeenCalled();
  });
});
