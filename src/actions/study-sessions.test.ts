import { describe, expect, test, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/db/schema", () => ({
  cards: { id: "id", uuid: "uuid" },
}));

vi.mock("drizzle-orm", () => ({
  inArray: vi.fn(),
}));

vi.mock("@/db/queries/decks", () => ({
  getDeckByUuidAndUser: vi.fn(),
}));

vi.mock("@/db/queries/study-sessions", () => ({
  insertStudySession: vi.fn(),
  insertStudySessionCards: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import { insertStudySession, insertStudySessionCards } from "@/db/queries/study-sessions";
import { saveStudySessionAction } from "./study-sessions";

const mockAuth = vi.mocked(auth);
const mockDb = vi.mocked(db);
const mockGetDeckByUuidAndUser = vi.mocked(getDeckByUuidAndUser);
const mockInsertStudySession = vi.mocked(insertStudySession);
const mockInsertStudySessionCards = vi.mocked(insertStudySessionCards);

const DECK_UUID = "01960000-0000-7000-8000-000000000001";
const CARD_UUID_1 = "01960000-0000-7000-8000-000000000011";
const CARD_UUID_2 = "01960000-0000-7000-8000-000000000012";
const CARD_UUID_3 = "01960000-0000-7000-8000-000000000013";
const USER_ID = "user_123";

const validInput = {
  deckUuid: DECK_UUID,
  cardResults: [
    { cardUuid: CARD_UUID_1, isCorrect: true },
    { cardUuid: CARD_UUID_2, isCorrect: false },
    { cardUuid: CARD_UUID_3, isCorrect: true },
  ],
};

function setupDbSelectMock(rows: { id: number; uuid: string }[]) {
  (mockDb.select as ReturnType<typeof vi.fn>).mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(rows),
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupDbSelectMock([
    { id: 10, uuid: CARD_UUID_1 },
    { id: 11, uuid: CARD_UUID_2 },
    { id: 12, uuid: CARD_UUID_3 },
  ]);
});

describe("saveStudySessionAction", () => {
  test("returns Unauthorized error when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockGetDeckByUuidAndUser).not.toHaveBeenCalled();
  });

  test("returns validation error when deckUuid is not a valid uuid", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await saveStudySessionAction({
      deckUuid: "not-a-uuid",
      cardResults: [{ cardUuid: CARD_UUID_1, isCorrect: true }],
    });

    expect(result).toHaveProperty("error");
    expect(mockGetDeckByUuidAndUser).not.toHaveBeenCalled();
  });

  test("returns validation error when cardResults is empty", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await saveStudySessionAction({ deckUuid: DECK_UUID, cardResults: [] });

    expect(result).toHaveProperty("error");
    expect(mockGetDeckByUuidAndUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found error when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue(undefined);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockGetDeckByUuidAndUser).toHaveBeenCalledWith(DECK_UUID, USER_ID);
    expect(mockInsertStudySession).not.toHaveBeenCalled();
  });

  test("inserts session with correct counts and returns success with sessionUuid", async () => {
    const SESSION_UUID = "01960000-0000-7000-8000-000000000099";
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue({ uuid: DECK_UUID, name: "Test Deck" } as never);
    mockInsertStudySession.mockResolvedValue({ id: 42, uuid: SESSION_UUID } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined as never);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ success: true, sessionUuid: SESSION_UUID });
    expect(mockInsertStudySession).toHaveBeenCalledWith({
      clerkUserId: USER_ID,
      deckUuid: DECK_UUID,
      totalCards: 3,
      correctCount: 2,
      incorrectCount: 1,
    });
  });

  test("inserts study session cards with resolved internal ids", async () => {
    const SESSION_UUID = "01960000-0000-7000-8000-000000000099";
    const SESSION_ID = 99;
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue({ uuid: DECK_UUID } as never);
    mockInsertStudySession.mockResolvedValue({ id: SESSION_ID, uuid: SESSION_UUID } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined as never);

    await saveStudySessionAction(validInput);

    expect(mockInsertStudySessionCards).toHaveBeenCalledWith([
      { sessionId: SESSION_ID, cardId: 10, isCorrect: true },
      { sessionId: SESSION_ID, cardId: 11, isCorrect: false },
      { sessionId: SESSION_ID, cardId: 12, isCorrect: true },
    ]);
  });

  test("correctly counts all correct results", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue({ uuid: DECK_UUID } as never);
    mockInsertStudySession.mockResolvedValue({ id: 1, uuid: "01960000-0000-7000-8000-000000000099" } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined as never);
    setupDbSelectMock([
      { id: 10, uuid: CARD_UUID_1 },
      { id: 11, uuid: CARD_UUID_2 },
    ]);

    await saveStudySessionAction({
      deckUuid: DECK_UUID,
      cardResults: [
        { cardUuid: CARD_UUID_1, isCorrect: true },
        { cardUuid: CARD_UUID_2, isCorrect: true },
      ],
    });

    expect(mockInsertStudySession).toHaveBeenCalledWith(
      expect.objectContaining({ correctCount: 2, incorrectCount: 0 })
    );
  });

  test("correctly counts all incorrect results", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockGetDeckByUuidAndUser.mockResolvedValue({ uuid: DECK_UUID } as never);
    mockInsertStudySession.mockResolvedValue({ id: 1, uuid: "01960000-0000-7000-8000-000000000099" } as never);
    mockInsertStudySessionCards.mockResolvedValue(undefined as never);
    setupDbSelectMock([
      { id: 10, uuid: CARD_UUID_1 },
      { id: 11, uuid: CARD_UUID_2 },
    ]);

    await saveStudySessionAction({
      deckUuid: DECK_UUID,
      cardResults: [
        { cardUuid: CARD_UUID_1, isCorrect: false },
        { cardUuid: CARD_UUID_2, isCorrect: false },
      ],
    });

    expect(mockInsertStudySession).toHaveBeenCalledWith(
      expect.objectContaining({ correctCount: 0, incorrectCount: 2 })
    );
  });
});
