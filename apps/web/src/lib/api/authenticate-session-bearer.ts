import { createClerkClient } from "@clerk/backend";

type SessionAuthShape = {
  userId: string | null;
  has: (args: { feature?: string; plan?: string }) => boolean;
};

export type SessionBearerAuth = {
  userId: string;
  has: SessionAuthShape["has"];
};

function getClerkBackend() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) {
    throw new Error("Missing CLERK_SECRET_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  return createClerkClient({ secretKey, publishableKey });
}

/**
 * Authenticates `Authorization: Bearer` session JWTs via Clerk's backend client.
 * Used by REST `withAuth` and MCP session fallback (extension / non-cookie clients).
 *
 * @param req - Incoming HTTP request (must include `Authorization: Bearer …` when used)
 * @returns Signed-in user id and `has()` helper, or `null` when absent or invalid
 */
export async function authenticateSessionBearer(
  req: Request
): Promise<SessionBearerAuth | null> {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const clerk = getClerkBackend();
  const state = await clerk.authenticateRequest(req, {
    acceptsToken: "session_token",
  });
  if (state.status !== "signed-in") return null;

  const sessionAuth = (state.toAuth as unknown as () => SessionAuthShape)();
  if (!sessionAuth.userId) return null;

  return {
    userId: sessionAuth.userId,
    has: sessionAuth.has,
  };
}
