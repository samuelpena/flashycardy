import { z } from "zod";
import { updateCardForUser } from "@/db/queries/cards";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const replaceCardInputSchema = z.object({
  deckUuid: z.string().uuid(),
  cardUuid: z.string().uuid(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

export type ReplaceCardInput = z.infer<typeof replaceCardInputSchema>;

/**
 * Replaces card front/back (`PUT /api/decks/[deckUuid]/cards/[cardUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck/card UUIDs and replacement text
 */
export async function runReplaceCard(ctx: McpToolContext, input: ReplaceCardInput) {
  const result = await updateCardForUser(ctx.userId, {
    deckUuid: input.deckUuid,
    cardUuid: input.cardUuid,
    front: input.front,
    back: input.back,
  });
  if (result.status === "deck-not-found") return mcpToolError("Deck not found");
  if (result.status === "card-not-found") return mcpToolError("Card not found");
  return mcpJsonContent({ data: result.card });
}
