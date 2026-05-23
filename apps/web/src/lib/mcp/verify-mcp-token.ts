import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { authenticateSessionBearer } from "@/lib/api/authenticate-session-bearer";

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

  const sessionAuth = await authenticateSessionBearer(req);
  if (!sessionAuth) return undefined;

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
