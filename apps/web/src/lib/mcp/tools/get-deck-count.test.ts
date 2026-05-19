import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { runGetDeckCount } from "./get-deck-count";

vi.mock("@/db/queries/decks", () => ({
  getDeckCountByUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: true };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runGetDeckCount", () => {
  test("returns count for the authenticated user", async () => {
    vi.mocked(decks.getDeckCountByUser).mockResolvedValue(7);
    const out = await runGetDeckCount(ctx);
    const body = JSON.parse(out.content[0].text);
    expect(body.data.count).toBe(7);
    expect(decks.getDeckCountByUser).toHaveBeenCalledWith(ctx.userId);
  });

  test("returns zero when user has no decks", async () => {
    vi.mocked(decks.getDeckCountByUser).mockResolvedValue(0);
    const out = await runGetDeckCount(ctx);
    expect(JSON.parse(out.content[0].text).data.count).toBe(0);
  });
});
