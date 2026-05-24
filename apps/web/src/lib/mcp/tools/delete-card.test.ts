import { afterEach, describe, expect, test, vi } from "vitest";
import * as cards from "@/db/queries/cards";
import { runDeleteCard } from "./delete-card";

vi.mock("@/db/queries/cards", () => ({
  deleteCardForUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runDeleteCard", () => {
  test("returns deleted card", async () => {
    const card = { uuid: "660e8400-e29b-41d4-a716-446655440000" } as never;
    vi.mocked(cards.deleteCardForUser).mockResolvedValue({ status: "success", card });
    const out = await runDeleteCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(out.isError).toBeUndefined();
  });

  test("errors when deck not found", async () => {
    vi.mocked(cards.deleteCardForUser).mockResolvedValue({ status: "deck-not-found" });
    const out = await runDeleteCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(out.isError).toBe(true);
  });
});
