import { z } from "zod";
import {
  getStudySessionCountsByUser,
  getStudySessionDeckCountByUser,
} from "@/db/queries/study-sessions";
import { pageFieldsSchema, parsePageArgs, paginationMeta } from "@/lib/mcp/pagination-args";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const listStudySessionCountsInputSchema = pageFieldsSchema;

export type ListStudySessionCountsInput = z.infer<typeof listStudySessionCountsInputSchema>;

/**
 * Paginated session counts grouped by deck (`GET /api/study-sessions/counts`).
 *
 * @param ctx - Authenticated user context
 * @param input - Pagination fields
 */
export async function runListStudySessionCounts(
  ctx: McpToolContext,
  input: ListStudySessionCountsInput
) {
  const p = parsePageArgs(input);
  if (!p.ok) return mcpToolError(p.error);

  const counts = await getStudySessionCountsByUser(ctx.userId, {
    limit: p.value.limit,
    offset: p.value.offset,
  });
  const totalItems = await getStudySessionDeckCountByUser(ctx.userId);
  return mcpJsonContent({
    data: counts,
    meta: paginationMeta(totalItems, p.value),
  });
}
