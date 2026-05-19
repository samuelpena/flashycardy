import { afterEach, describe, expect, test, vi } from "vitest";
import * as decks from "@/db/queries/decks";
import { runDeleteDeck } from "./delete-deck";

vi.mock("@/db/queries/decks", () => ({
  deleteDeckByUuidAndUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runDeleteDeck", () => {
  test("returns deleted deck row", async () => {
    const row = { uuid: "550e8400-e29b-41d4-a716-446655440000", name: "D" } as never;
    vi.mocked(decks.deleteDeckByUuidAndUser).mockResolvedValue([row]);
    const out = await runDeleteDeck(ctx, { deckUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(out.isError).toBeUndefined();
  });

  test("errors when not found", async () => {
    vi.mocked(decks.deleteDeckByUuidAndUser).mockResolvedValue([] as never);
    const out = await runDeleteDeck(ctx, { deckUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(out.isError).toBe(true);
  });
});
