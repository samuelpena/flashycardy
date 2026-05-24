import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const DECK_UUID = "550e8400-e29b-41d4-a716-446655440000";

beforeAll(() => {
  process.env.CLERK_SECRET_KEY ??= "sk_test_unit";
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_unit";
});

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/decks/generate-cards-for-deck", () => ({
  generateCardsForDeck: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { generateCardsForDeck } from "@/lib/decks/generate-cards-for-deck";
import { POST } from "./route";

const has = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/decks/[deckUuid]/generate-cards", () => {
  test("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, has } as never);
    const req = new NextRequest(`http://localhost:3000/api/decks/${DECK_UUID}/generate-cards`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ deckUuid: DECK_UUID }) });
    expect(res.status).toBe(401);
  });

  test("returns 403 without ai_flashcard_generation feature", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(false);

    const req = new NextRequest(`http://localhost:3000/api/decks/${DECK_UUID}/generate-cards`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ deckUuid: DECK_UUID }) });
    expect(res.status).toBe(403);
  });

  test("returns 400 when deck has no description", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(generateCardsForDeck).mockResolvedValue({ error: "no_description" });

    const req = new NextRequest(`http://localhost:3000/api/decks/${DECK_UUID}/generate-cards`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ deckUuid: DECK_UUID }) });
    expect(res.status).toBe(400);
  });

  test("returns 200 on success", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(generateCardsForDeck).mockResolvedValue({ ok: true });

    const req = new NextRequest(`http://localhost:3000/api/decks/${DECK_UUID}/generate-cards`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ deckUuid: DECK_UUID }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.success).toBe(true);
  });

  test("returns 500 when AI fails", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(generateCardsForDeck).mockResolvedValue({ error: "ai_failed" });

    const req = new NextRequest(`http://localhost:3000/api/decks/${DECK_UUID}/generate-cards`, {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ deckUuid: DECK_UUID }) });
    expect(res.status).toBe(500);
  });
});
