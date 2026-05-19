import { getDeckCountByUser } from "@/db/queries/decks";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent } from "@/lib/mcp/tool-result";

/**
 * Returns deck count for the current user (`GET /api/decks/count`).
 *
 * @param ctx - Authenticated user context
 */
export async function runGetDeckCount(ctx: McpToolContext) {
  const count = await getDeckCountByUser(ctx.userId);
  return mcpJsonContent({ data: { count } });
}
