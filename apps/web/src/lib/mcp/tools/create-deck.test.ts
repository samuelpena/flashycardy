import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { runCreateDeck } from "./create-deck";

vi.mock("@/db/queries/decks", () => ({
  getDeckCountByUser: vi.fn(),
  insertDeck: vi.fn(),
  insertDeckWithCards: vi.fn(),
}));

const deckRow = {
  id: 1,
  uuid: "550e8400-e29b-41d4-a716-446655440001",
  clerkUserId: "user_test",
  name: "N",
  description: null as string | null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("runCreateDeck", () => {
  test("creates deck without cards when under free limit", async () => {
    vi.mocked(decks.getDeckCountByUser).mockResolvedValue(1);
    vi.mocked(decks.insertDeck).mockResolvedValue([deckRow] as Awaited<ReturnType<typeof decks.insertDeck>>);

    const out = await runCreateDeck(
      { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false },
      { name: "My deck" }
    );
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.uuid).toBe(deckRow.uuid);
    expect(decks.insertDeckWithCards).not.toHaveBeenCalled();
  });

  test("blocks free users at deck limit", async () => {
    vi.mocked(decks.getDeckCountByUser).mockResolvedValue(3);
    const out = await runCreateDeck(
      { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false },
      { name: "X" }
    );
    expect(out.isError).toBe(true);
    expect(decks.insertDeck).not.toHaveBeenCalled();
  });

  test("skips deck count gate when user has unlimited decks feature", async () => {
    vi.mocked(decks.insertDeck).mockResolvedValue([deckRow] as Awaited<ReturnType<typeof decks.insertDeck>>);
    const out = await runCreateDeck(
      { userId: "user_test", hasUnlimitedDecks: true, hasAiFlashcardGeneration: true, hasDocumentDeckGeneration: true },
      { name: "Pro" }
    );
    expect(out.isError).toBeUndefined();
    expect(decks.getDeckCountByUser).not.toHaveBeenCalled();
  });
});
