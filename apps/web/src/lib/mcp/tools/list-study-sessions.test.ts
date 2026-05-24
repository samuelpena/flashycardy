import { afterEach, describe, expect, test, vi } from "vitest";
import * as study from "@/db/queries/study-sessions";
import { runListStudySessions } from "./list-study-sessions";

vi.mock("@/db/queries/study-sessions", () => ({
  getAllStudySessionsByUser: vi.fn(),
  getStudySessionCountByUser: vi.fn(),
}));

const ctx = { userId: "user_test", hasUnlimitedDecks: false, hasAiFlashcardGeneration: false, hasDocumentDeckGeneration: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("runListStudySessions", () => {
  test("returns sessions and meta", async () => {
    vi.mocked(study.getAllStudySessionsByUser).mockResolvedValue([{ id: 1 }] as never);
    vi.mocked(study.getStudySessionCountByUser).mockResolvedValue(3);
    const out = await runListStudySessions(ctx, { page: 1, pageSize: 20 });
    expect(out.isError).toBeUndefined();
    expect(JSON.parse(out.content[0].text).meta.total_items).toBe(3);
  });

  test("rejects invalid pageSize", async () => {
    const out = await runListStudySessions(ctx, { page: 1, pageSize: 500 });
    expect(out.isError).toBe(true);
    expect(study.getAllStudySessionsByUser).not.toHaveBeenCalled();
  });
});
