import { z } from "zod";
import { getDeckMetadataByUuidAndUser } from "@/db/queries/decks";
import { getCardRatingsByDeck, getCardRatingsCountByDeck } from "@/db/queries/study-sessions";
import { pageFieldsSchema, parsePageArgs, paginationMeta } from "@/lib/mcp/pagination-args";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const listRatingsInputSchema = z
  .object({
    deckUuid: z.string().uuid(),
  })
  .merge(pageFieldsSchema);

export type ListRatingsInput = z.infer<typeof listRatingsInputSchema>;

/**
 * Lists aggregated rating counts per card (`GET /api/decks/[deckUuid]/ratings`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and pagination
 */
export async function runListRatings(ctx: McpToolContext, input: ListRatingsInput) {
  const { deckUuid, ...pageInput } = input;
  const p = parsePageArgs(pageInput);
  if (!p.ok) return mcpToolError(p.error);

  const deck = await getDeckMetadataByUuidAndUser(deckUuid, ctx.userId);
  if (!deck) return mcpToolError("Deck not found");

  const ratings = await getCardRatingsByDeck(deckUuid, ctx.userId, {
    limit: p.value.limit,
    offset: p.value.offset,
  });
  const totalItems = await getCardRatingsCountByDeck(deckUuid, ctx.userId);
  return mcpJsonContent({
    data: ratings,
    meta: paginationMeta(totalItems, p.value),
  });
}
