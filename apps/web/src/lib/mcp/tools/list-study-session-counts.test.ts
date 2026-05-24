import { afterEach, describe, expect, test, vi } from "vitest";
import * as study from "@/db/queries/study-sessions";
import { runListStudySessionCounts } from "./list-study-session-counts";

vi.mock("@/db/queries/study-sessions", () => ({
  getStudySessionCountsByUser: vi.fn(),
  getStudySessionDeckCountByUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runListStudySessionCounts", () => {
  test("returns counts and meta", async () => {
    vi.mocked(study.getStudySessionCountsByUser).mockResolvedValue([
      { deckUuid: "550e8400-e29b-41d4-a716-446655440000", sessionCount: 2 },
    ] as never);
    vi.mocked(study.getStudySessionDeckCountByUser).mockResolvedValue(1);
    const out = await runListStudySessionCounts(ctx, { page: 1, pageSize: 20 });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).data[0].sessionCount).toBe(2);
  });

  test("rejects invalid page", async () => {
    const out = await runListStudySessionCounts(ctx, { page: 0, pageSize: 20 });
    expect(out.isError).toBe(true);
  });
});
