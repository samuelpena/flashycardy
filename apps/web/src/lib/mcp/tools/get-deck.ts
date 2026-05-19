import { z } from "zod";
import { getDeckMetadataByUuidAndUser } from "@/db/queries/decks";
import { getCardCountByDeckUuidAndUser, getCardsByDeckUuidAndUser } from "@/db/queries/cards";
import { pageFieldsSchema, parsePageArgs, paginationMeta } from "@/lib/mcp/pagination-args";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const getDeckInputSchema = z
  .object({
    deckUuid: z.string().uuid(),
  })
  .merge(pageFieldsSchema);

export type GetDeckInput = z.infer<typeof getDeckInputSchema>;

/**
 * Returns deck metadata and paginated cards (`GET /api/decks/[deckUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and pagination for the card list
 */
export async function runGetDeck(ctx: McpToolContext, input: GetDeckInput) {
  const { deckUuid, ...pageInput } = input;
  const p = parsePageArgs(pageInput);
  if (!p.ok) return mcpToolError(p.error);

  const deck = await getDeckMetadataByUuidAndUser(deckUuid, ctx.userId);
  if (!deck) return mcpToolError("Deck not found");

  const cardsResult = await getCardsByDeckUuidAndUser(deckUuid, ctx.userId, {
    limit: p.value.limit,
    offset: p.value.offset,
  });
  if (cardsResult.status === "deck-not-found") return mcpToolError("Deck not found");

  const cardCountResult = await getCardCountByDeckUuidAndUser(deckUuid, ctx.userId);
  if (cardCountResult.status === "deck-not-found") return mcpToolError("Deck not found");

  return mcpJsonContent({
    data: { ...deck, cards: cardsResult.cards },
    meta: paginationMeta(cardCountResult.count, p.value),
  });
}
