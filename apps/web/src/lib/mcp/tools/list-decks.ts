import { z } from "zod";
import { getDeckCountByUser, getDecksByUser } from "@/db/queries/decks";
import { pageFieldsSchema, parsePageArgs, paginationMeta } from "@/lib/mcp/pagination-args";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const listDecksInputSchema = pageFieldsSchema;

export type ListDecksInput = z.infer<typeof listDecksInputSchema>;

/**
 * Lists the current user's decks (paginated), matching `GET /api/decks`.
 *
 * @param ctx - Authenticated user context
 * @param input - Pagination fields
 */
export async function runListDecks(ctx: McpToolContext, input: ListDecksInput) {
  const p = parsePageArgs(input);
  if (!p.ok) return mcpToolError(p.error);

  const decks = await getDecksByUser(ctx.userId, {
    limit: p.value.limit,
    offset: p.value.offset,
  });
  const totalItems = await getDeckCountByUser(ctx.userId);
  return mcpJsonContent({
    data: decks,
    meta: paginationMeta(totalItems, p.value),
  });
}
