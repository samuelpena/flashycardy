import { z } from "zod";
import { deleteDeckByUuidAndUser } from "@/db/queries/decks";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const deleteDeckInputSchema = z.object({
  deckUuid: z.string().uuid(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckInputSchema>;

/**
 * Deletes a deck (`DELETE /api/decks/[deckUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID
 */
export async function runDeleteDeck(ctx: McpToolContext, input: DeleteDeckInput) {
  const [deck] = await deleteDeckByUuidAndUser(input.deckUuid, ctx.userId);
  if (!deck) return mcpToolError("Deck not found");
  return mcpJsonContent({ data: deck });
}
