import { describe, expect, test, vi, beforeEach } from "vitest";
import { saveStudySessionAction } from "./study-sessions";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db/queries/decks", () => ({
  getDeckByIdAndUser: vi.fn(),
}));

vi.mock("@/db/queries/study-sessions", () => ({
  insertStudySession: vi.fn(),
  insertStudySessionCards: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { insertStudySession, insertStudySessionCards } from "@/db/queries/study-sessions";

const mockAuth = vi.mocked(auth);
const mockGetDeckByIdAndUser = vi.mocked(getDeckByIdAndUser);
const mockInsertStudySession = vi.mocked(insertStudySession);
const mockInsertStudySessionCards = vi.mocked(insertStudySessionCards);

const validInput = {
  deckId: 1,
  cardResults: [
    { cardId: 10, isCorrect: true },
    { cardId: 11, isCorrect: false },
    { cardId: 12, isCorrect: true },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveStudySessionAction", () => {
  test("returns Unauthorized error when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockGetDeckByIdAndUser).not.toHaveBeenCalled();
  });

  test("returns validation error when deckId is not a positive integer", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as never);

    const result = await saveStudySessionAction({ deckId: -1, cardResults: [{ cardId: 1, isCorrect: true }] });

    expect(result).toHaveProperty("error");
    expect(mockGetDeckByIdAndUser).not.toHaveBeenCalled();
  });

  test("returns validation error when cardResults is empty", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as never);

    const result = await saveStudySessionAction({ deckId: 1, cardResults: [] });

    expect(result).toHaveProperty("error");
    expect(mockGetDeckByIdAndUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found error when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as never);
    mockGetDeckByIdAndUser.mockResolvedValue(undefined);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockGetDeckByIdAndUser).toHaveBeenCalledWith(validInput.deckId, "user_123");
    expect(mockInsertStudySession).not.toHaveBeenCalled();
  });

  test("inserts session with correct counts and returns success", async () => {
    const sessionId = 42;
    mockAuth.mockResolvedValue({ userId: "user_123" } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ id: 1, name: "Test Deck" } as never);
    mockInsertStudySession.mockResolvedValue({ id: sessionId } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ success: true, sessionId });

    expect(mockInsertStudySession).toHaveBeenCalledWith({
      clerkUserId: "user_123",
      deckId: validInput.deckId,
      totalCards: 3,
      correctCount: 2,
      incorrectCount: 1,
    });
  });

  test("inserts study session cards with correct payload", async () => {
    const sessionId = 99;
    mockAuth.mockResolvedValue({ userId: "user_123" } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ id: 1 } as never);
    mockInsertStudySession.mockResolvedValue({ id: sessionId } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined);

    await saveStudySessionAction(validInput);

    expect(mockInsertStudySessionCards).toHaveBeenCalledWith([
      { sessionId, cardId: 10, isCorrect: true },
      { sessionId, cardId: 11, isCorrect: false },
      { sessionId, cardId: 12, isCorrect: true },
    ]);
  });

  test("correctly counts all correct results", async () => {
    const allCorrect = {
      deckId: 1,
      cardResults: [
        { cardId: 1, isCorrect: true },
        { cardId: 2, isCorrect: true },
      ],
    };

    mockAuth.mockResolvedValue({ userId: "user_123" } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ id: 1 } as never);
    mockInsertStudySession.mockResolvedValue({ id: 1 } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined);

    await saveStudySessionAction(allCorrect);

    expect(mockInsertStudySession).toHaveBeenCalledWith(
      expect.objectContaining({ correctCount: 2, incorrectCount: 0 })
    );
  });

  test("correctly counts all incorrect results", async () => {
    const allWrong = {
      deckId: 1,
      cardResults: [
        { cardId: 1, isCorrect: false },
        { cardId: 2, isCorrect: false },
      ],
    };

    mockAuth.mockResolvedValue({ userId: "user_123" } as never);
    mockGetDeckByIdAndUser.mockResolvedValue({ id: 1 } as never);
    mockInsertStudySession.mockResolvedValue({ id: 1 } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined);

    await saveStudySessionAction(allWrong);

    expect(mockInsertStudySession).toHaveBeenCalledWith(
      expect.objectContaining({ correctCount: 0, incorrectCount: 2 })
    );
  });
});
