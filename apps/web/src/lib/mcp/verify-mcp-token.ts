import { createClerkClient } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

function getClerkBackend() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) {
    throw new Error("Missing CLERK_SECRET_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  return createClerkClient({ secretKey, publishableKey });
}

type SessionAuthShape = {
  userId: string | null;
  has: (args: { feature?: string; plan?: string }) => boolean;
};

/**
 * Verifies MCP `Authorization: Bearer` using Clerk’s OAuth flow first (`verifyClerkToken`),
 * then falls back to a Clerk session JWT for compatibility with REST-style clients.
 *
 * @param req - Incoming MCP HTTP request
 * @param bearerToken - Raw bearer string (no `Bearer ` prefix)
 * @returns MCP `AuthInfo` for `withMcpAuth`, or `undefined` when neither OAuth nor session validates
 */
export async function verifyMcpToken(
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const oauthAuth = await auth({ acceptsToken: "oauth_token" });
  const oauthAuthInfo = verifyClerkToken(oauthAuth, bearerToken);
  if (oauthAuthInfo?.extra && typeof oauthAuthInfo.extra.userId === "string") {
    const userId = oauthAuthInfo.extra.userId;
    const hasUnlimitedDecks =
      oauthAuth.isAuthenticated &&
      oauthAuth.tokenType === "oauth_token" &&
      oauthAuth.has({ feature: "unlimited_decks" });
    return {
      ...oauthAuthInfo,
      extra: {
        userId,
        hasUnlimitedDecks,
      },
    };
  }

  const clerk = getClerkBackend();
  const state = await clerk.authenticateRequest(req, {
    acceptsToken: "session_token",
  });
  if (state.status !== "signed-in") return undefined;

  const sessionAuth = (state.toAuth as unknown as () => SessionAuthShape)();
  if (!sessionAuth.userId) return undefined;

  return {
    token: bearerToken,
    clientId: sessionAuth.userId,
    scopes: ["openid", "profile", "email"],
    extra: {
      userId: sessionAuth.userId,
      hasUnlimitedDecks: sessionAuth.has({ feature: "unlimited_decks" }),
    },
  };
}
