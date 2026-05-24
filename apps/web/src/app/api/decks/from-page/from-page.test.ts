import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const PAGE_TEXT = "a".repeat(100);

beforeAll(() => {
  process.env.CLERK_SECRET_KEY ??= "sk_test_unit";
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_unit";
});

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/decks/generate-deck-from-content", () => ({
  generateDeckFromContent: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { generateDeckFromContent } from "@/lib/decks/generate-deck-from-content";
import { POST } from "./route";

const has = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/decks/from-page", () => {
  test("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, has } as never);
    const req = new NextRequest("http://localhost:3000/api/decks/from-page", {
      method: "POST",
      body: JSON.stringify({ pageText: PAGE_TEXT }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  test("returns 403 without document_deck_generation feature", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockImplementation(({ feature }: { feature?: string }) => feature !== "document_deck_generation");

    const req = new NextRequest("http://localhost:3000/api/decks/from-page", {
      method: "POST",
      body: JSON.stringify({ pageText: PAGE_TEXT }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
  });

  test("returns 400 when page text is too short", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);

    const req = new NextRequest("http://localhost:3000/api/decks/from-page", {
      method: "POST",
      body: JSON.stringify({ pageText: "short" }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("enough text");
    expect(generateDeckFromContent).not.toHaveBeenCalled();
  });

  test("returns 403 when free deck limit reached", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockImplementation(({ feature }: { feature?: string }) => {
      if (feature === "document_deck_generation") return true;
      if (feature === "unlimited_decks") return false;
      return false;
    });
    vi.mocked(generateDeckFromContent).mockResolvedValue({ error: "deck_limit_reached" });

    const req = new NextRequest("http://localhost:3000/api/decks/from-page", {
      method: "POST",
      body: JSON.stringify({ pageText: PAGE_TEXT }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
  });

  test("returns 201 with deckUuid on success", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(generateDeckFromContent).mockResolvedValue({
      ok: true,
      deckUuid: "550e8400-e29b-41d4-a716-446655440001",
    });

    const req = new NextRequest("http://localhost:3000/api/decks/from-page", {
      method: "POST",
      body: JSON.stringify({
        pageText: PAGE_TEXT,
        pageUrl: "https://example.com/article",
        pageTitle: "Example Article",
      }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.deckUuid).toBe("550e8400-e29b-41d4-a716-446655440001");
    expect(generateDeckFromContent).toHaveBeenCalledWith(
      "user_1",
      {
        contentText: PAGE_TEXT,
        pageUrl: "https://example.com/article",
        pageTitle: "Example Article",
      },
      { hasUnlimitedDecks: true },
    );
  });

  test("returns 500 when AI generation fails", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(generateDeckFromContent).mockResolvedValue({ error: "ai_failed" });

    const req = new NextRequest("http://localhost:3000/api/decks/from-page", {
      method: "POST",
      body: JSON.stringify({ pageText: PAGE_TEXT }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(500);
  });
});
