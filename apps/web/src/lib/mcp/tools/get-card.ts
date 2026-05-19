import { z } from "zod";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const getCardInputSchema = z.object({
  deckUuid: z.string().uuid(),
  cardUuid: z.string().uuid(),
});

export type GetCardInput = z.infer<typeof getCardInputSchema>;

/**
 * Returns a single card (`GET /api/decks/[deckUuid]/cards/[cardUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck and card UUIDs
 */
export async function runGetCard(ctx: McpToolContext, input: GetCardInput) {
  const deck = await getDeckByUuidAndUser(input.deckUuid, ctx.userId);
  if (!deck) return mcpToolError("Deck not found");

  const card = deck.cards.find((row) => row.uuid === input.cardUuid);
  if (!card) return mcpToolError("Card not found");

  return mcpJsonContent({ data: card });
}
