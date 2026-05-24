import { afterEach, describe, expect, test, vi } from "vitest";
import * as study from "@/db/queries/study-sessions";
import { runCreateStudySession } from "./create-study-session";

vi.mock("@/db/queries/study-sessions", () => ({
  saveStudySessionForUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runCreateStudySession", () => {
  test("persists session when deck exists", async () => {
    vi.mocked(study.saveStudySessionForUser).mockResolvedValue({
      status: "success",
      session: { id: 9 } as never,
    });
    const out = await runCreateStudySession(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardResults: [{ cardUuid: "660e8400-e29b-41d4-a716-446655440000", isCorrect: true }],
    });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data.id).toBe(9);
  });

  test("errors when deck not found", async () => {
    vi.mocked(study.saveStudySessionForUser).mockResolvedValue({ status: "deck-not-found" });
    const out = await runCreateStudySession(ctx, {
      deckUuid: "550e8400-e29b-41d4-a716-446655440000",
      cardResults: [{ cardUuid: "660e8400-e29b-41d4-a716-446655440000", isCorrect: false }],
    });
    expect(out.isError).toBe(true);
  });
});
