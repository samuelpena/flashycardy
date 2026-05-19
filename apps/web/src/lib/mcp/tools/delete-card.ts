import { z } from "zod";
import { deleteCardForUser } from "@/db/queries/cards";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const deleteCardInputSchema = z.object({
  deckUuid: z.string().uuid(),
  cardUuid: z.string().uuid(),
});

export type DeleteCardInput = z.infer<typeof deleteCardInputSchema>;

/**
 * Deletes a card (`DELETE /api/decks/[deckUuid]/cards/[cardUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck and card UUIDs
 */
export async function runDeleteCard(ctx: McpToolContext, input: DeleteCardInput) {
  const result = await deleteCardForUser(ctx.userId, {
    deckUuid: input.deckUuid,
    cardUuid: input.cardUuid,
  });
  if (result.status === "deck-not-found") return mcpToolError("Deck not found");
  if (result.status === "card-not-found") return mcpToolError("Card not found");
  return mcpJsonContent({ data: result.card });
}
