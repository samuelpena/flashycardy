import { z } from "zod";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import { updateCardForUser } from "@/db/queries/cards";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const patchCardInputSchema = z
  .object({
    deckUuid: z.string().uuid(),
    cardUuid: z.string().uuid(),
    front: z.string().min(1).optional(),
    back: z.string().min(1).optional(),
  })
  .refine((v) => v.front !== undefined || v.back !== undefined, {
    message: "At least one of front or back is required",
  });

export type PatchCardInput = z.infer<typeof patchCardInputSchema>;

/**
 * Partial card update (`PATCH /api/decks/[deckUuid]/cards/[cardUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck/card UUIDs and optional fields
 */
export async function runPatchCard(ctx: McpToolContext, input: PatchCardInput) {
  const deck = await getDeckByUuidAndUser(input.deckUuid, ctx.userId);
  if (!deck) return mcpToolError("Deck not found");

  const card = deck.cards.find((row) => row.uuid === input.cardUuid);
  if (!card) return mcpToolError("Card not found");

  const result = await updateCardForUser(ctx.userId, {
    deckUuid: input.deckUuid,
    cardUuid: input.cardUuid,
    front: input.front ?? card.front,
    back: input.back ?? card.back,
  });
  if (result.status === "deck-not-found") return mcpToolError("Deck not found");
  if (result.status === "card-not-found") return mcpToolError("Card not found");
  return mcpJsonContent({ data: result.card });
}
