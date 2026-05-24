import { afterEach, describe, expect, test, vi } from "vitest";
import { generateCardsForDeck } from "@/lib/decks/generate-cards-for-deck";
import { runGenerateCards } from "./generate-cards";

vi.mock("@/lib/decks/generate-cards-for-deck", () => ({
  generateCardsForDeck: vi.fn(),
}));

const DECK_UUID = "550e8400-e29b-41d4-a716-446655440000";

const ctx = {
  userId: "user_test",
  hasUnlimitedDecks: false,
  hasAiFlashcardGeneration: true,
  hasDocumentDeckGeneration: false,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("runGenerateCards", () => {
  test("blocks users without AI flashcard generation feature", async () => {
    const out = await runGenerateCards(
      { ...ctx, hasAiFlashcardGeneration: false },
      { deckUuid: DECK_UUID },
    );
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("Pro plan");
    expect(generateCardsForDeck).not.toHaveBeenCalled();
  });

  test("returns success on completion", async () => {
    vi.mocked(generateCardsForDeck).mockResolvedValue({ ok: true });

    const out = await runGenerateCards(ctx, { deckUuid: DECK_UUID });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.success).toBe(true);
    expect(generateCardsForDeck).toHaveBeenCalledWith(ctx.userId, DECK_UUID);
  });

  test("errors when deck not found", async () => {
    vi.mocked(generateCardsForDeck).mockResolvedValue({ error: "deck_not_found" });

    const out = await runGenerateCards(ctx, { deckUuid: DECK_UUID });
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toBe("Deck not found");
  });

  test("errors when deck has no description", async () => {
    vi.mocked(generateCardsForDeck).mockResolvedValue({ error: "no_description" });

    const out = await runGenerateCards(ctx, { deckUuid: DECK_UUID });
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("description");
  });
});
