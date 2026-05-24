import { afterEach, describe, expect, test, vi } from "vitest";
import * as generate from "@/lib/decks/generate-deck-from-content";
import { runGenerateDeckFromPageContent } from "./generate-deck-from-page-content";

vi.mock("@/lib/decks/generate-deck-from-content", () => ({
  generateDeckFromContent: vi.fn(),
}));

const ctx = {
  userId: "user_test",
  hasUnlimitedDecks: false,
  hasAiFlashcardGeneration: false,
  hasDocumentDeckGeneration: true,
};

const PAGE_TEXT = "x".repeat(100);

afterEach(() => {
  vi.clearAllMocks();
});

describe("runGenerateDeckFromPageContent", () => {
  test("returns deckUuid on success", async () => {
    vi.mocked(generate.generateDeckFromContent).mockResolvedValue({
      ok: true,
      deckUuid: "550e8400-e29b-41d4-a716-446655440001",
    });

    const out = await runGenerateDeckFromPageContent(ctx, {
      pageText: PAGE_TEXT,
      pageTitle: "Article",
    });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.deckUuid).toBe(
      "550e8400-e29b-41d4-a716-446655440001",
    );
  });

  test("blocks without document_deck_generation feature", async () => {
    const out = await runGenerateDeckFromPageContent(
      { ...ctx, hasDocumentDeckGeneration: false },
      { pageText: PAGE_TEXT },
    );
    expect(out.isError).toBe(true);
    expect(generate.generateDeckFromContent).not.toHaveBeenCalled();
  });

  test("returns error when page text too short for schema", async () => {
    const out = await runGenerateDeckFromPageContent(ctx, { pageText: "tiny" });
    expect(out.isError).toBe(true);
    expect(generate.generateDeckFromContent).not.toHaveBeenCalled();
  });

  test("maps deck limit error", async () => {
    vi.mocked(generate.generateDeckFromContent).mockResolvedValue({
      error: "deck_limit_reached",
    });
    const out = await runGenerateDeckFromPageContent(ctx, { pageText: PAGE_TEXT });
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("Deck limit");
  });

  test("maps AI failure", async () => {
    vi.mocked(generate.generateDeckFromContent).mockResolvedValue({ error: "ai_failed" });
    const out = await runGenerateDeckFromPageContent(ctx, { pageText: PAGE_TEXT });
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("Could not generate");
  });
});
