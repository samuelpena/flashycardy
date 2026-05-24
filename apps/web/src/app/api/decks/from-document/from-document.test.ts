import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.CLERK_SECRET_KEY ??= "sk_test_unit";
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_unit";
});

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/decks/create-deck-from-document", () => ({
  createDeckFromDocument: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { createDeckFromDocument } from "@/lib/decks/create-deck-from-document";
import { POST } from "./route";

const has = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/decks/from-document", () => {
  test("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, has } as never);
    const req = new NextRequest("http://localhost:3000/api/decks/from-document", {
      method: "POST",
      body: JSON.stringify({ fileBase64: "YQ==", fileName: "notes.pdf" }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  test("returns 403 without document_deck_generation feature", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockImplementation(({ feature }: { feature?: string }) => feature !== "document_deck_generation");

    const req = new NextRequest("http://localhost:3000/api/decks/from-document", {
      method: "POST",
      body: JSON.stringify({ fileBase64: "YQ==", fileName: "notes.pdf" }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
  });

  test("returns 403 when free deck limit reached", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockImplementation(({ feature }: { feature?: string }) => {
      if (feature === "document_deck_generation") return true;
      if (feature === "unlimited_decks") return false;
      return false;
    });
    vi.mocked(createDeckFromDocument).mockResolvedValue({ error: "deck_limit_reached" });

    const req = new NextRequest("http://localhost:3000/api/decks/from-document", {
      method: "POST",
      body: JSON.stringify({ fileBase64: "YQ==", fileName: "notes.pdf" }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Deck limit");
  });

  test("returns 201 with deckUuid on success", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(createDeckFromDocument).mockResolvedValue({
      ok: true,
      deckUuid: "550e8400-e29b-41d4-a716-446655440001",
    });

    const req = new NextRequest("http://localhost:3000/api/decks/from-document", {
      method: "POST",
      body: JSON.stringify({ fileBase64: "YQ==", fileName: "notes.pdf" }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.deckUuid).toBe("550e8400-e29b-41d4-a716-446655440001");
  });

  test("returns 500 when AI generation fails", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: "user_1", has } as never);
    has.mockReturnValue(true);
    vi.mocked(createDeckFromDocument).mockResolvedValue({ error: "ai_failed" });

    const req = new NextRequest("http://localhost:3000/api/decks/from-document", {
      method: "POST",
      body: JSON.stringify({ fileBase64: "YQ==", fileName: "notes.pdf" }),
    });
    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(500);
  });
});
