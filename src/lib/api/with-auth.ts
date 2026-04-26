import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";

type RouteContext<P extends Record<string, string> = Record<string, string>> = {
  params: Promise<P>;
};

type AuthResult = Awaited<ReturnType<typeof auth>>;

type AuthedContext<P extends Record<string, string> = Record<string, string>> =
  RouteContext<P> & { userId: string; has: AuthResult["has"] };

type AuthedHandler<P extends Record<string, string> = Record<string, string>> =
  (req: NextRequest, ctx: AuthedContext<P>) => Promise<NextResponse>;

/**
 * Wraps a Route Handler with Clerk authentication.
 * Injects `userId` into the handler context and returns a 401 when the
 * request is unauthenticated, so individual handlers never repeat the check.
 *
 * @example
 * export const GET = withAuth(async (_req, { userId }) => {
 *   const decks = await getDecksByUser(userId);
 *   return NextResponse.json({ data: decks });
 * });
 */
export function withAuth<P extends Record<string, string> = Record<string, string>>(
  handler: AuthedHandler<P>
) {
  return async (
    req: NextRequest,
    ctx: RouteContext<P> = { params: Promise.resolve({} as P) }
  ): Promise<NextResponse> => {
    const { userId, has } = await auth();

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    return handler(req, { ...ctx, userId, has });
  };
}
