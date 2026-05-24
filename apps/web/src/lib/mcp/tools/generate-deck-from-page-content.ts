import { z } from "zod";
import { generateDeckFromContent } from "@/lib/decks/generate-deck-from-content";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const generateDeckFromPageContentInputSchema = z.object({
  pageText: z.string().min(100).max(50_000),
  pageUrl: z.string().url().optional(),
  pageTitle: z.string().max(255).optional(),
});

export type GenerateDeckFromPageContentInput = z.infer<
  typeof generateDeckFromPageContentInputSchema
>;

/**
 * Creates a deck from web page text (`POST /api/decks/from-page`).
 */
export async function runGenerateDeckFromPageContent(
  ctx: McpToolContext,
  input: GenerateDeckFromPageContentInput,
) {
  if (!ctx.hasDocumentDeckGeneration) {
    return mcpToolError("Document-based deck generation requires a Pro plan");
  }

  const parsed = generateDeckFromPageContentInputSchema.safeParse(input);
  if (!parsed.success) {
    const tooShort = parsed.error.issues.some(
      (issue) => issue.path[0] === "pageText" && issue.code === "too_small",
    );
    if (tooShort) {
      return mcpToolError("This page does not have enough text to generate a deck");
    }
    return mcpToolError("Invalid request body");
  }

  const result = await generateDeckFromContent(
    ctx.userId,
    {
      contentText: parsed.data.pageText,
      pageUrl: parsed.data.pageUrl,
      pageTitle: parsed.data.pageTitle,
    },
    { hasUnlimitedDecks: ctx.hasUnlimitedDecks },
  );

  if ("error" in result) {
    switch (result.error) {
      case "deck_limit_reached":
        return mcpToolError("Deck limit reached for the free plan");
      case "save_failed":
        return mcpToolError("Failed to save the deck");
      default:
        return mcpToolError("Could not generate a deck from this page. Try again");
    }
  }

  return mcpJsonContent({ data: { deckUuid: result.deckUuid } });
}
