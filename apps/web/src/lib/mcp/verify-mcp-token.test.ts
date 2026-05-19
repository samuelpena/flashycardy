import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

beforeAll(() => {
  process.env.CLERK_SECRET_KEY ??= "sk_test_unit";
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_unit";
});

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@clerk/mcp-tools/next", () => ({
  verifyClerkToken: vi.fn(),
}));

vi.mock("@clerk/backend", () => ({
  createClerkClient: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { verifyMcpToken } from "./verify-mcp-token";

const req = new Request("https://example.com/api/mcp", {
  headers: { Authorization: "Bearer token" },
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("verifyMcpToken", () => {
  test("returns AuthInfo when OAuth path succeeds", async () => {
    vi.mocked(auth).mockResolvedValue({
      isAuthenticated: true,
      tokenType: "oauth_token",
      has: vi.fn().mockReturnValue(true),
    } as never);
    vi.mocked(verifyClerkToken).mockReturnValue({
      token: "token",
      clientId: "oauth_client",
      scopes: ["profile"],
      extra: { userId: "user_oauth" },
    } as never);

    const out = await verifyMcpToken(req, "token");
    expect(out?.extra).toMatchObject({
      userId: "user_oauth",
      hasUnlimitedDecks: true,
    });
    expect(createClerkClient).not.toHaveBeenCalled();
  });

  test("falls back to session when OAuth verification fails", async () => {
    vi.mocked(auth).mockResolvedValue({
      isAuthenticated: false,
      tokenType: "oauth_token",
    } as never);
    vi.mocked(verifyClerkToken).mockReturnValue(undefined);

    const toAuth = vi.fn().mockReturnValue({
      userId: "user_sess",
      has: vi.fn().mockReturnValue(false),
    });
    vi.mocked(createClerkClient).mockReturnValue({
      authenticateRequest: vi.fn().mockResolvedValue({
        status: "signed-in",
        toAuth,
      }),
    } as never);

    const out = await verifyMcpToken(req, "sess-jwt");
    expect(out?.extra).toMatchObject({
      userId: "user_sess",
      hasUnlimitedDecks: false,
    });
    expect(toAuth).toHaveBeenCalled();
  });

  test("returns undefined when no bearer token", async () => {
    expect(await verifyMcpToken(req, undefined)).toBeUndefined();
  });
});
