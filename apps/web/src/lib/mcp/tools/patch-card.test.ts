import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import * as cards from "@/db/queries/cards";
import { patchCardInputSchema, runPatchCard } from "./patch-card";

vi.mock("@/db/queries/decks", () => ({
  getDeckByUuidAndUser: vi.fn(),
}));
vi.mock("@/db/queries/cards", () => ({
  updateCardForUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runPatchCard", () => {
  test("schema rejects when neither front nor back", () => {
    const r = patchCardInputSchema.safeParse({
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(false);
  });

  test("errors when deck not found", async () => {
    vi.mocked(decks.getDeckByUuidAndUser).mockResolvedValue(undefined);
    const out = await runPatchCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardUuid: "660e8400-e29b-41d4-a716-446655440000",
      front: "x",
    });
    expect(out.isError).toBe(true);
    expect(cards.updateCardForUser).not.toHaveBeenCalled();
  });
});
