import { z } from "zod";
import {
  getAllStudySessionsByUser,
  getStudySessionCountByUser,
} from "@/db/queries/study-sessions";
import { pageFieldsSchema, parsePageArgs, paginationMeta } from "@/lib/mcp/pagination-args";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const listStudySessionsInputSchema = pageFieldsSchema;

export type ListStudySessionsInput = z.infer<typeof listStudySessionsInputSchema>;

/**
 * Lists study sessions for the user (`GET /api/study-sessions`).
 *
 * @param ctx - Authenticated user context
 * @param input - Pagination fields
 */
export async function runListStudySessions(ctx: McpToolContext, input: ListStudySessionsInput) {
  const p = parsePageArgs(input);
  if (!p.ok) return mcpToolError(p.error);

  const sessions = await getAllStudySessionsByUser(ctx.userId, {
    limit: p.value.limit,
    offset: p.value.offset,
  });
  const totalItems = await getStudySessionCountByUser(ctx.userId);
  return mcpJsonContent({
    data: sessions,
    meta: paginationMeta(totalItems, p.value),
  });
}
