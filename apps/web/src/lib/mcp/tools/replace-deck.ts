import { z } from "zod";
import { updateDeckByUuid } from "@/db/queries/decks";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const replaceDeckInputSchema = z.object({
  deckUuid: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

export type ReplaceDeckInput = z.infer<typeof replaceDeckInputSchema>;

/**
 * Full replace of deck name/description (`PUT /api/decks/[deckUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and replacement fields
 */
export async function runReplaceDeck(ctx: McpToolContext, input: ReplaceDeckInput) {
  const [deck] = await updateDeckByUuid(input.deckUuid, ctx.userId, {
    name: input.name,
    description: input.description ?? null,
  });
  if (!deck) return mcpToolError("Deck not found");
  return mcpJsonContent({ data: deck });
}
