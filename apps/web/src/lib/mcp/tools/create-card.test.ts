import { afterEach, describe, expect, test, vi } from "vitest";
import * as cards from "@/db/queries/cards";
import { runCreateCard } from "./create-card";

vi.mock("@/db/queries/cards", () => ({
  insertCardForUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runCreateCard", () => {
  test("returns created card", async () => {
    const cardUuid = "660e8400-e29b-41d4-a716-446655440000";
    const card = {
      id: 1,
      uuid: cardUuid,
      front: "f",
      back: "b",
      deckId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(cards.insertCardForUser).mockResolvedValue({ status: "success", card });
    const out = await runCreateCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      front: "f",
      back: "b",
    });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.uuid).toBe(cardUuid);
  });

  test("errors when deck not found", async () => {
    vi.mocked(cards.insertCardForUser).mockResolvedValue({ status: "deck-not-found" });
    const out = await runCreateCard(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      front: "f",
      back: "b",
    });
    expect(out.isError).toBe(true);
  });
});
