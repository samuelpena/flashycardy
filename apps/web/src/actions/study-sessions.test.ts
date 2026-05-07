import { describe, expect, test, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db/queries/study-sessions", () => ({
  saveStudySessionForUser: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { saveStudySessionForUser } from "@/db/queries/study-sessions";
import { saveStudySessionAction } from "./study-sessions";

const mockAuth = vi.mocked(auth);
const mockSaveStudySessionForUser = vi.mocked(saveStudySessionForUser);

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveStudySessionAction", () => {
  test("returns Unauthorized error when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockSaveStudySessionForUser).not.toHaveBeenCalled();
  });

  test("returns validation error when deckUuid is not a valid uuid", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await saveStudySessionAction({
      deckUuid: "not-a-uuid",
      cardResults: [{ cardUuid: CARD_UUID_1, isCorrect: true }],
    });

    expect(result).toHaveProperty("error");
    expect(mockSaveStudySessionForUser).not.toHaveBeenCalled();
  });

  test("returns validation error when cardResults is empty", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await saveStudySessionAction({ deckUuid: DECK_UUID, cardResults: [] });

    expect(result).toHaveProperty("error");
    expect(mockSaveStudySessionForUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found error when deck does not belong to user", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockSaveStudySessionForUser.mockResolvedValue({ status: "deck-not-found" });

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockSaveStudySessionForUser).toHaveBeenCalledWith({
      userId: USER_ID,
      deckUuid: DECK_UUID,
      cardResults: validInput.cardResults,
    });
  });

  test("inserts session with correct counts and returns success with sessionUuid", async () => {
    const SESSION_UUID = "01960000-0000-7000-8000-000000000099";
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockSaveStudySessionForUser.mockResolvedValue({
      status: "success",
      session: { id: 42, uuid: SESSION_UUID } as never,
    });

    const result = await saveStudySessionAction(validInput);

    expect(result).toEqual({ success: true, sessionUuid: SESSION_UUID });
    expect(mockSaveStudySessionForUser).toHaveBeenCalledWith({
      userId: USER_ID,
      deckUuid: DECK_UUID,
      cardResults: validInput.cardResults,
    });
  });
});
