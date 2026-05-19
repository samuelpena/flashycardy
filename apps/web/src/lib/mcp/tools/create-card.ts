import { z } from "zod";
import { insertCardForUser } from "@/db/queries/cards";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const createCardInputSchema = z.object({
  deckUuid: z.string().uuid(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

export type CreateCardInput = z.infer<typeof createCardInputSchema>;

/**
 * Creates a card in a deck (`POST /api/decks/[deckUuid]/cards`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and card text
 */
export async function runCreateCard(ctx: McpToolContext, input: CreateCardInput) {
  const result = await insertCardForUser(ctx.userId, {
    deckUuid: input.deckUuid,
    front: input.front,
    back: input.back,
  });
  if (result.status === "deck-not-found") return mcpToolError("Deck not found");
  if (result.status !== "success") return mcpToolError("Failed to create card");
  return mcpJsonContent({ data: result.card });
}
