import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { runReplaceDeck } from "./replace-deck";

vi.mock("@/db/queries/decks", () => ({
  updateDeckByUuid: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runReplaceDeck", () => {
  test("returns updated deck", async () => {
    const row = { uuid: "550e8400-e29b-41d4-a716-446655440000", name: "N", description: null };
    vi.mocked(decks.updateDeckByUuid).mockResolvedValue([row] as never);
    const out = await runReplaceDeck(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      name: "N",
    });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.name).toBe("N");
  });

  test("returns error when deck not owned", async () => {
    vi.mocked(decks.updateDeckByUuid).mockResolvedValue([] as never);
    const out = await runReplaceDeck(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      name: "N",
    });
    expect(out.isError).toBe(true);
  });
});
