import { z } from "zod";
import { createDeckFromDocument } from "@/lib/decks/create-deck-from-document";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const createDeckFromDocumentInputSchema = z.object({
  fileBase64: z.string().min(1),
  fileName: z.string().min(1).max(255),
});

export type CreateDeckFromDocumentMcpInput = z.infer<typeof createDeckFromDocumentInputSchema>;

/**
 * Creates a deck from an uploaded document (`POST /api/decks/from-document`).
 */
export async function runCreateDeckFromDocument(
  ctx: McpToolContext,
  input: CreateDeckFromDocumentMcpInput,
) {
  if (!ctx.hasDocumentDeckGeneration) {
    return mcpToolError("Document-based deck generation requires a Pro plan");
  }

  const result = await createDeckFromDocument(ctx.userId, input, {
    hasUnlimitedDecks: ctx.hasUnlimitedDecks,
  });

  if ("error" in result) {
    switch (result.error) {
      case "unsupported_file_type":
        return mcpToolError("Unsupported file type. Upload a .pdf, .docx, or .pptx file");
      case "invalid_file_data":
        return mcpToolError("Invalid file data");
      case "file_size_exceeded":
        return mcpToolError("File must be non-empty and at most 10 MB");
      case "no_text":
        return mcpToolError("Could not read any text from this file");
      case "document_read_error":
        return mcpToolError("Could not read this document");
      case "deck_limit_reached":
        return mcpToolError("Deck limit reached for the free plan");
      case "save_failed":
        return mcpToolError("Failed to save the deck");
      default:
        return mcpToolError("Could not generate a deck from this document");
    }
  }

  return mcpJsonContent({ data: { deckUuid: result.deckUuid } });
}
