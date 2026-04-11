import { expect, test, vi, beforeEach, describe } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db/queries/decks", () => ({
  getDeckByIdAndUser: vi.fn(),
}));

vi.mock("@/db/queries/cards", () => ({
  insertCard: vi.fn(),
  insertCards: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
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
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { insertCard, insertCards, updateCard, deleteCard } from "@/db/queries/cards";
import { generateText } from "ai";
import {
  createCardAction,
  updateCardAction,
  deleteCardAction,
  generateCardsAction,
} from "./cards";

const mockAuth = vi.mocked(auth);
const mockGetDeckByIdAndUser = vi.mocked(getDeckByIdAndUser);
const mockInsertCard = vi.mocked(insertCard);
const mockInsertCards = vi.mocked(insertCards);
const mockUpdateCard = vi.mocked(updateCard);
const mockDeleteCard = vi.mocked(deleteCard);
const mockGenerateText = vi.mocked(generateText);
const mockRevalidatePath = vi.mocked(revalidatePath);

const DECK_ID = 1;
const CARD_ID = 10;
const USER_ID = "user_123";

const mockDeck = {
  id: DECK_ID,
  name: "Biology 101",
  description: "Basic biology concepts",
  clerkUserId: USER_ID,
  createdAt: new Date(),
  cards: [{ id: CARD_ID, front: "Q", back: "A", deckId: DECK_ID, createdAt: new Date() }],
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

    const result = await createCardAction({ deckId: DECK_ID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockInsertCard).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await createCardAction({ deckId: DECK_ID, front: "", back: "A" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockInsertCard).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(undefined);

    const result = await createCardAction({ deckId: DECK_ID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockInsertCard).not.toHaveBeenCalled();
  });

  test("inserts card and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(mockDeck);
    mockInsertCard.mockResolvedValue([] as never);

    const result = await createCardAction({ deckId: DECK_ID, front: "Q", back: "A" });

    expect(result).toEqual({ success: true });
    expect(mockInsertCard).toHaveBeenCalledWith({ deckId: DECK_ID, front: "Q", back: "A" });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_ID}`);
  });
});

// ---------------------------------------------------------------------------
// updateCardAction
// ---------------------------------------------------------------------------

describe("updateCardAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await updateCardAction({ cardId: CARD_ID, deckId: DECK_ID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await updateCardAction({ cardId: CARD_ID, deckId: DECK_ID, front: "Q", back: "" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(undefined);

    const result = await updateCardAction({ cardId: CARD_ID, deckId: DECK_ID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  test("returns Card not found when card is not in deck", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ ...mockDeck, cards: [] });

    const result = await updateCardAction({ cardId: CARD_ID, deckId: DECK_ID, front: "Q", back: "A" });

    expect(result).toEqual({ error: "Card not found" });
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  test("updates card and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(mockDeck);
    mockUpdateCard.mockResolvedValue([] as never);

    const result = await updateCardAction({ cardId: CARD_ID, deckId: DECK_ID, front: "New Q", back: "New A" });

    expect(result).toEqual({ success: true });
    expect(mockUpdateCard).toHaveBeenCalledWith(CARD_ID, DECK_ID, { front: "New Q", back: "New A" });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_ID}`);
  });
});

// ---------------------------------------------------------------------------
// deleteCardAction
// ---------------------------------------------------------------------------

describe("deleteCardAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await deleteCardAction({ cardId: CARD_ID, deckId: DECK_ID });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await deleteCardAction({ cardId: -1, deckId: DECK_ID });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(undefined);

    const result = await deleteCardAction({ cardId: CARD_ID, deckId: DECK_ID });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  test("returns Card not found when card is not in deck", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ ...mockDeck, cards: [] });

    const result = await deleteCardAction({ cardId: CARD_ID, deckId: DECK_ID });

    expect(result).toEqual({ error: "Card not found" });
    expect(mockDeleteCard).not.toHaveBeenCalled();
  });

  test("deletes card and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(mockDeck);
    mockDeleteCard.mockResolvedValue(undefined as never);

    const result = await deleteCardAction({ cardId: CARD_ID, deckId: DECK_ID });

    expect(result).toEqual({ success: true });
    expect(mockDeleteCard).toHaveBeenCalledWith(CARD_ID, DECK_ID);
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_ID}`);
  });
});

// ---------------------------------------------------------------------------
// generateCardsAction
// ---------------------------------------------------------------------------

describe("generateCardsAction", () => {
  const mockHas = vi.fn();

  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null, has: mockHas } as never);

    const result = await generateCardsAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns error when user does not have AI feature", async () => {
    mockHas.mockReturnValue(false);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);

    const result = await generateCardsAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "AI flashcard generation requires a Pro plan." });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns Deck not found when deck does not belong to user", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(undefined);

    const result = await generateCardsAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns error when deck has no description", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ ...mockDeck, description: null });

    const result = await generateCardsAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "Add a description to your deck before generating cards." });
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  test("returns error when AI output is empty", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(mockDeck);
    mockGenerateText.mockResolvedValue({ output: null } as never);

    const result = await generateCardsAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "Failed to generate cards. Please try again." });
    expect(mockInsertCards).not.toHaveBeenCalled();
  });

  test("inserts AI-generated cards and revalidates on success", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(mockDeck);
    mockGenerateText.mockResolvedValue({
      output: { cards: [{ front: "Q1", back: "A1" }, { front: "Q2", back: "A2" }] },
    } as never);
    mockInsertCards.mockResolvedValue([] as never);

    const result = await generateCardsAction({ deckId: DECK_ID });

    expect(result).toEqual({ success: true });
    expect(mockInsertCards).toHaveBeenCalledWith([
      { deckId: DECK_ID, front: "Q1", back: "A1" },
      { deckId: DECK_ID, front: "Q2", back: "A2" },
    ]);
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_ID}`);
  });
});
