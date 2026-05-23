import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

beforeAll(() => {
  process.env.CLERK_SECRET_KEY ??= "sk_test_unit";
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_unit";
});

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@clerk/backend", () => ({
  createClerkClient: vi.fn(),
}));

vi.mock("@/db/queries/decks", () => ({
  getDecksByUser: vi.fn().mockResolvedValue([{ uuid: "deck-1", name: "Spanish" }]),
  getDeckCountByUser: vi.fn().mockResolvedValue(1),
}));

import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { GET } from "./route";

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/decks auth", () => {
  test("returns 200 with Authorization Bearer session JWT", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, has: vi.fn() } as never);

    const toAuth = vi.fn().mockReturnValue({
      userId: "user_bearer",
      has: vi.fn().mockReturnValue(true),
    });
    vi.mocked(createClerkClient).mockReturnValue({
      authenticateRequest: vi.fn().mockResolvedValue({
        status: "signed-in",
        toAuth,
      }),
    } as never);

    const req = new NextRequest("http://localhost:3000/api/decks", {
      headers: { Authorization: "Bearer sess-jwt" },
    });

    const res = await GET(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toEqual([{ uuid: "deck-1", name: "Spanish" }]);
    expect(createClerkClient).toHaveBeenCalled();
  });

  test("cookie session auth unchanged", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "user_cookie",
      has: vi.fn().mockReturnValue(true),
    } as never);

    const req = new NextRequest("http://localhost:3000/api/decks");
    const res = await GET(req, { params: Promise.resolve({}) });

    expect(res.status).toBe(200);
    expect(createClerkClient).not.toHaveBeenCalled();
  });

  test("returns 401 without cookie or valid bearer", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, has: vi.fn() } as never);
    vi.mocked(createClerkClient).mockReturnValue({
      authenticateRequest: vi.fn().mockResolvedValue({ status: "signed-out" }),
    } as never);

    const req = new NextRequest("http://localhost:3000/api/decks");
    const res = await GET(req, { params: Promise.resolve({}) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});
