import { afterEach, describe, expect, test, vi } from "vitest";
import { createDeckFromDocument } from "@/lib/decks/create-deck-from-document";
import { runCreateDeckFromDocument } from "./create-deck-from-document";

vi.mock("@/lib/decks/create-deck-from-document", () => ({
  createDeckFromDocument: vi.fn(),
}));

const ctx = {
  userId: "user_test",
  hasUnlimitedDecks: false,
  hasAiFlashcardGeneration: false,
  hasDocumentDeckGeneration: true,
};

const input = {
  fileBase64: "YQ==",
  fileName: "notes.pdf",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("runCreateDeckFromDocument", () => {
  test("blocks users without document deck generation feature", async () => {
    const out = await runCreateDeckFromDocument(
      { ...ctx, hasDocumentDeckGeneration: false },
      input,
    );
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("Pro plan");
    expect(createDeckFromDocument).not.toHaveBeenCalled();
  });

  test("returns deckUuid on success", async () => {
    const deckUuid = "550e8400-e29b-41d4-a716-446655440001";
    vi.mocked(createDeckFromDocument).mockResolvedValue({ ok: true, deckUuid });

    const out = await runCreateDeckFromDocument(ctx, input);
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.deckUuid).toBe(deckUuid);
    expect(createDeckFromDocument).toHaveBeenCalledWith(ctx.userId, input, {
      hasUnlimitedDecks: ctx.hasUnlimitedDecks,
    });
  });

  test("maps deck limit error", async () => {
    vi.mocked(createDeckFromDocument).mockResolvedValue({ error: "deck_limit_reached" });

    const out = await runCreateDeckFromDocument(ctx, input);
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("Deck limit");
  });

  test("maps unsupported file type error", async () => {
    vi.mocked(createDeckFromDocument).mockResolvedValue({ error: "unsupported_file_type" });

    const out = await runCreateDeckFromDocument(ctx, input);
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toContain("Unsupported file type");
  });
});
