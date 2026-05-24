import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { preflight } from "@/lib/api/cors";
import { jsonData, jsonError } from "@/lib/api/responses";
import { createDeckFromDocument } from "@/lib/decks/create-deck-from-document";

export { preflight as OPTIONS };

const createFromDocumentSchema = z.object({
  fileBase64: z.string().min(1),
  fileName: z.string().min(1).max(255),
});

export const POST = withAuth(async (req, { userId, has }) => {
  if (!has({ feature: "document_deck_generation" })) {
    return jsonError("Document-based deck generation requires a Pro plan", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = createFromDocumentSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request body", 400);

  const result = await createDeckFromDocument(userId, parsed.data, {
    hasUnlimitedDecks: has({ feature: "unlimited_decks" }),
  });

  if ("error" in result) {
    switch (result.error) {
      case "unsupported_file_type":
        return jsonError("Unsupported file type. Upload a .pdf, .docx, or .pptx file", 400);
      case "invalid_file_data":
        return jsonError("Invalid file data", 400);
      case "file_size_exceeded":
        return jsonError("File must be non-empty and at most 10 MB", 400);
      case "no_text":
        return jsonError("Could not read any text from this file", 400);
      case "document_read_error":
        return jsonError("Could not read this document", 400);
      case "deck_limit_reached":
        return jsonError("Deck limit reached for the free plan", 403);
      case "ai_failed":
        return jsonError("Could not generate a deck from this document", 500);
      case "save_failed":
        return jsonError("Failed to save the deck", 500);
      default:
        return jsonError("Could not generate a deck from this document", 500);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${result.deckUuid}`);
  return jsonData({ deckUuid: result.deckUuid }, 201);
});
