import { afterEach, describe, expect, test, vi } from "vitest";
import * as cards from "@/db/queries/cards";
import { runReplaceCard } from "./replace-card";

vi.mock("@/db/queries/cards", () => ({
  updateCardForUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runReplaceCard", () => {
  test("returns updated card", async () => {
    const card = { uuid: "660e8400-e29b-41d4-a716-446655440000", front: "a", back: "b" } as never;
    vi.mocked(cards.updateCardForUser).mockResolvedValue({ status: "success", card });
    const out = await runReplaceCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
      front: "a",
      back: "b",
    });
    expect(out.isError).toBeUndefined();
  });

  test("errors on card not found", async () => {
    vi.mocked(cards.updateCardForUser).mockResolvedValue({ status: "card-not-found" });
    const out = await runReplaceCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
      front: "a",
      back: "b",
    });
    expect(out.isError).toBe(true);
  });
});
