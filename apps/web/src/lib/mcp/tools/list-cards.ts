import { z } from "zod";
import { getCardCountByDeckUuidAndUser, getCardsByDeckUuidAndUser } from "@/db/queries/cards";
import { pageFieldsSchema, parsePageArgs, paginationMeta } from "@/lib/mcp/pagination-args";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const listCardsInputSchema = z
  .object({
    deckUuid: z.string().uuid(),
  })
  .merge(pageFieldsSchema);

export type ListCardsInput = z.infer<typeof listCardsInputSchema>;

/**
 * Lists cards in a deck (`GET /api/decks/[deckUuid]/cards`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and pagination
 */
export async function runListCards(ctx: McpToolContext, input: ListCardsInput) {
  const { deckUuid, ...pageInput } = input;
  const p = parsePageArgs(pageInput);
  if (!p.ok) return mcpToolError(p.error);

  const cardsResult = await getCardsByDeckUuidAndUser(deckUuid, ctx.userId, {
    limit: p.value.limit,
    offset: p.value.offset,
  });
  if (cardsResult.status === "deck-not-found") return mcpToolError("Deck not found");

  const countResult = await getCardCountByDeckUuidAndUser(deckUuid, ctx.userId);
  if (countResult.status === "deck-not-found") return mcpToolError("Deck not found");

  return mcpJsonContent({
    data: cardsResult.cards,
    meta: paginationMeta(countResult.count, p.value),
  });
}
