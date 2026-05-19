import { z } from "zod";
import {
  getDeckCountByUser,
  insertDeck,
  insertDeckWithCards,
} from "@/db/queries/decks";
import { FREE_DECK_LIMIT } from "@/lib/mcp/constants";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const createDeckInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1, "Front is required"),
        back: z.string().min(1, "Back is required"),
      })
    )
    .optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckInputSchema>;

/**
 * Creates a deck for the current user (`POST /api/decks`), including free-plan deck limit.
 *
 * @param ctx - Authenticated user context (includes billing-derived `hasUnlimitedDecks`)
 * @param input - Validated body fields
 */
export async function runCreateDeck(ctx: McpToolContext, input: CreateDeckInput) {
  if (!ctx.hasUnlimitedDecks) {
    const deckCount = await getDeckCountByUser(ctx.userId);
    if (deckCount >= FREE_DECK_LIMIT) {
      return mcpToolError("Deck limit reached for the free plan");
    }
  }

  const deckValues = {
    clerkUserId: ctx.userId,
    name: input.name,
    description: input.description ?? null,
  };

  if (input.cards?.length) {
    const deck = await insertDeckWithCards(deckValues, input.cards);
    if (!deck) return mcpToolError("Failed to create deck");
    return mcpJsonContent({ data: deck });
  }

  const [deck] = await insertDeck(deckValues);
  if (!deck) return mcpToolError("Failed to create deck");
  return mcpJsonContent({ data: deck });
}
