import { expect, test, vi, beforeEach, describe } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db/queries/decks", () => ({
  getDeckByUuidAndUser: vi.fn(),
}));

vi.mock("@/db/queries/cards", () => ({
  insertCardForUser: vi.fn(),
  insertCards: vi.fn(),
  updateCardForUser: vi.fn(),
  deleteCardForUser: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: {
    object: vi.fn((opts) => opts),
  },
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn((model: string) => model),
}));

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import {
  deleteCardForUser,
  insertCardForUser,
  insertCards,
  updateCardForUser,
} from "@/db/queries/cards";
import { generateText } from "ai";
import {
  createCardAction,
  updateCardAction,
  deleteCardAction,
  generateCardsAction,
} from "./cards";

const mockAuth = vi.mocked(auth);
const mockGetDeckByUuidAndUser = vi.mocked(getDeckByUuidAndUser);
const mockInsertCardForUser = vi.mocked(insertCardForUser);
const mockInsertCards = vi.mocked(insertCards);
const mockUpdateCardForUser = vi.mocked(updateCardForUser);
const mockDeleteCardForUser = vi.mocked(deleteCardForUser);
const mockGenerateText = vi.mocked(generateText);
const mockRevalidatePath = vi.mocked(revalidatePath);

const DECK_UUID = "01960000-0000-7000-8000-000000000001";
const CARD_UUID = "01960000-0000-7000-8000-000000000002";
const USER_ID = "user_123";

const mockDeck = {
  id: 1,
  uuid: DECK_UUID,
  name: "Biology 101",
  description: "Basic biology concepts",
  clerkUserId: USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  cards: [{ id: 1, uuid: CARD_UUID, front: "Q", back: "A", deckId: 1, createdAt: new Date(), updatedAt: new Date() }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createCardAction
// ---------------------------------------------------------------------------

describe("createCardAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await createCardAction({ deckUuid: DECK_UUID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockInsertCardForUser).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await createCardAction({ deckUuid: DECK_UUID, front: "", back: "A" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockInsertCardForUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockInsertCardForUser.mockResolvedValue({ status: "deck-not-found" });

    const result = await createCardAction({ deckUuid: DECK_UUID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockInsertCardForUser).toHaveBeenCalledWith(USER_ID, { deckUuid: DECK_UUID, front: "Q", back: "A" });
  });

  test("inserts card and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockInsertCardForUser.mockResolvedValue({ status: "success", card: mockDeck.cards[0] });

    const result = await createCardAction({ deckUuid: DECK_UUID, front: "Q", back: "A" });

    expect(result).toEqual({ success: true });
    expect(mockInsertCardForUser).toHaveBeenCalledWith(USER_ID, { deckUuid: DECK_UUID, front: "Q", back: "A" });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });
});

// ---------------------------------------------------------------------------
// updateCardAction
// ---------------------------------------------------------------------------

describe("updateCardAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await updateCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockUpdateCardForUser).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await updateCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID, front: "Q", back: "" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockUpdateCardForUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateCardForUser.mockResolvedValue({ status: "deck-not-found" });

    const result = await updateCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockUpdateCardForUser).toHaveBeenCalledWith(USER_ID, {
      cardUuid: CARD_UUID,
      deckUuid: DECK_UUID,
      front: "Q",
      back: "A",
    });
  });

  test("returns Card not found when card is not in deck", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateCardForUser.mockResolvedValue({ status: "card-not-found" });

    const result = await updateCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Card not found" });
    expect(mockUpdateCardForUser).toHaveBeenCalledWith(USER_ID, {
      cardUuid: CARD_UUID,
      deckUuid: DECK_UUID,
      front: "Q",
      back: "A",
    });
  });

  test("updates card and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateCardForUser.mockResolvedValue({ status: "success", card: mockDeck.cards[0] });

    const result = await updateCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID, front: "New Q", back: "New A" });

    expect(result).toEqual({ success: true });
    expect(mockUpdateCardForUser).toHaveBeenCalledWith(USER_ID, {
      cardUuid: CARD_UUID,
      deckUuid: DECK_UUID,
      front: "New Q",
      back: "New A",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });
});

// ---------------------------------------------------------------------------
// deleteCardAction
// ---------------------------------------------------------------------------

describe("deleteCardAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await deleteCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockDeleteCardForUser).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await deleteCardAction({ cardUuid: "not-a-uuid", deckUuid: DECK_UUID });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockDeleteCardForUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteCardForUser.mockResolvedValue({ status: "deck-not-found" });

    const result = await deleteCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockDeleteCardForUser).toHaveBeenCalledWith(USER_ID, { cardUuid: CARD_UUID, deckUuid: DECK_UUID });
  });

  test("returns Card not found when card is not in deck", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteCardForUser.mockResolvedValue({ status: "card-not-found" });

    const result = await deleteCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Card not found" });
    expect(mockDeleteCardForUser).toHaveBeenCalledWith(USER_ID, { cardUuid: CARD_UUID, deckUuid: DECK_UUID });
  });

  test("deletes card and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteCardForUser.mockResolvedValue({ status: "success", card: mockDeck.cards[0] });

    const result = await deleteCardAction({ cardUuid: CARD_UUID, deckUuid: DECK_UUID });

    expect(result).toEqual({ success: true });
    expect(mockDeleteCardForUser).toHaveBeenCalledWith(USER_ID, { cardUuid: CARD_UUID, deckUuid: DECK_UUID });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });
});

// ---------------------------------------------------------------------------
// generateCardsAction
// ---------------------------------------------------------------------------

describe("generateCardsAction", () => {
  const mockHas = vi.fn();

  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null, has: mockHas } as never);

    const result = await generateCardsAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns error when user does not have AI feature", async () => {
    mockHas.mockReturnValue(false);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);

    const result = await generateCardsAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "AI flashcard generation requires a Pro plan." });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue(undefined);

    const result = await generateCardsAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns error when deck has no description", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue({ ...mockDeck, description: null });

    const result = await generateCardsAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Add a description to your deck before generating cards." });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns error when AI output is empty", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue(mockDeck);
    mockGenerateText.mockResolvedValue({ output: null } as never);

    const result = await generateCardsAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Failed to generate cards. Please try again." });
    expect(mockInsertCards).not.toHaveBeenCalled();
  });

  test("inserts AI-generated cards and revalidates on success", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue(mockDeck);
    mockGenerateText.mockResolvedValue({
      output: { cards: [{ front: "Q1", back: "A1" }, { front: "Q2", back: "A2" }] },
    } as never);
    mockInsertCards.mockResolvedValue([] as never);

    const result = await generateCardsAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ success: true });
    expect(mockInsertCards).toHaveBeenCalledWith(DECK_UUID, [
      { front: "Q1", back: "A1" },
      { front: "Q2", back: "A2" },
    ]);
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });
});
