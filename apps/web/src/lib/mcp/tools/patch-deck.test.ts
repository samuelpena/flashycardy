import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { patchDeckInputSchema, runPatchDeck } from "./patch-deck";

vi.mock("@/db/queries/decks", () => ({
  updateDeckByUuid: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runPatchDeck", () => {
  test("rejects empty patch object at schema level", () => {
    const parsed = patchDeckInputSchema.safeParse({
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(parsed.success).toBe(false);
  });

  test("updates when at least one field provided", async () => {
    const row = { uuid: "550e8400-e29b-41d4-a716-446655440000", name: "X", description: null };
    vi.mocked(decks.updateDeckByUuid).mockResolvedValue([row] as never);
    const out = await runPatchDeck(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      name: "X",
    });
    expect(out.isError).toBeUndefined();
  });
});
