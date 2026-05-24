import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { runGetCard } from "./get-card";

vi.mock("@/db/queries/decks", () => ({
  getDeckByUuidAndUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runGetCard", () => {
  test("returns card when present in deck", async () => {
    const cardUuid = "660e8400-e29b-41d4-a716-446655440000";
    vi.mocked(decks.getDeckByUuidAndUser).mockResolvedValue({
      cards: [{ uuid: cardUuid, front: "f", back: "b" }],
    } as Awaited<ReturnType<typeof decks.getDeckByUuidAndUser>>);
    const out = await runGetCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid,
    });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.uuid).toBe(cardUuid);
  });

  test("errors when deck missing", async () => {
    vi.mocked(decks.getDeckByUuidAndUser).mockResolvedValue(undefined);
    const out = await runGetCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(out.isError).toBe(true);
  });

  test("errors when card uuid not in deck", async () => {
    vi.mocked(decks.getDeckByUuidAndUser).mockResolvedValue({
      cards: [{ uuid: "11111111-1111-1111-1111-111111111111", front: "f", back: "b" }],
    } as Awaited<ReturnType<typeof decks.getDeckByUuidAndUser>>);
    const out = await runGetCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(out.isError).toBe(true);
  });
});
