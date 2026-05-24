import { z } from "zod";
import { generateCardsForDeck } from "@/lib/decks/generate-cards-for-deck";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const generateCardsInputSchema = z.object({
  deckUuid: z.string().uuid(),
});

export type GenerateCardsInput = z.infer<typeof generateCardsInputSchema>;

/**
 * AI-generates 20 cards for a deck (`POST /api/decks/[deckUuid]/generate-cards`).
 */
export async function runGenerateCards(ctx: McpToolContext, input: GenerateCardsInput) {
  if (!ctx.hasAiFlashcardGeneration) {
    return mcpToolError("AI flashcard generation requires a Pro plan");
  }

  const result = await generateCardsForDeck(ctx.userId, input.deckUuid);
  if ("error" in result) {
    switch (result.error) {
      case "deck_not_found":
        return mcpToolError("Deck not found");
      case "no_description":
        return mcpToolError("Add a description to your deck before generating cards");
      default:
        return mcpToolError("Failed to generate cards. Please try again");
    }
  }

  return mcpJsonContent({ data: { success: true } });
}
