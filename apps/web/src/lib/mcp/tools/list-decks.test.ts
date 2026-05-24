import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { runListDecks } from "./list-decks";

vi.mock("@/db/queries/decks", () => ({
  getDecksByUser: vi.fn(),
  getDeckCountByUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runListDecks", () => {
  test("returns paginated decks and meta", async () => {
    vi.mocked(decks.getDecksByUser).mockResolvedValue([
      {
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        name: "A",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cardCount: 2,
      },
    ] as Awaited<ReturnType<typeof decks.getDecksByUser>>);
    vi.mocked(decks.getDeckCountByUser).mockResolvedValue(5);

    const out = await runListDecks(ctx, { page: 1, pageSize: 20 });
    expect(out.isError).toBeUndefined();
    const body = JSON.parse(out.content[0].text);
    expect(body.data).toHaveLength(1);
    expect(body.meta.total_items).toBe(5);
    expect(decks.getDecksByUser).toHaveBeenCalledWith(ctx.userId, { limit: 20, offset: 0 });
  });

  test("rejects invalid pagination", async () => {
    const out = await runListDecks(ctx, { page: 0, pageSize: 20 });
    expect(out.isError).toBe(true);
  });

  test("does not call DB when pagination is invalid", async () => {
    await runListDecks(ctx, { pageSize: 200 });
    expect(decks.getDecksByUser).not.toHaveBeenCalled();
  });
});
