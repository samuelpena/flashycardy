import { getDeckCountByUser } from "@/db/queries/decks";
import { extractPlainTextFromDocumentBuffer } from "@/lib/extract-document-text";
import { generateDeckFromContent } from "@/lib/decks/generate-deck-from-content";

const FREE_DECK_LIMIT = 3;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const allowedDocExtensions = new Set([".pdf", ".docx", ".pptx"]);

export type CreateDeckFromDocumentError =
  | "unsupported_file_type"
  | "invalid_file_data"
  | "file_size_exceeded"
  | "no_text"
  | "document_read_error"
  | "deck_limit_reached"
  | "ai_failed"
  | "save_failed";

export type CreateDeckFromDocumentInput = {
  fileBase64: string;
  fileName: string;
};

/**
 * Creates a deck with 20 AI-generated cards from an uploaded document buffer.
 *
 * @param userId - Clerk user id
 * @param input - Base64 file payload and original filename
 * @param options - Plan gating (`hasUnlimitedDecks`)
 */
export async function createDeckFromDocument(
  userId: string,
  input: CreateDeckFromDocumentInput,
  options: { hasUnlimitedDecks: boolean },
): Promise<{ ok: true; deckUuid: string } | { error: CreateDeckFromDocumentError }> {
  const { fileBase64, fileName } = input;

  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  if (!allowedDocExtensions.has(ext)) {
    return { error: "unsupported_file_type" };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(fileBase64, "base64");
  } catch {
    return { error: "invalid_file_data" };
  }

  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
    return { error: "file_size_exceeded" };
  }

  if (!options.hasUnlimitedDecks) {
    const deckCount = await getDeckCountByUser(userId);
    if (deckCount >= FREE_DECK_LIMIT) {
      return { error: "deck_limit_reached" };
    }
  }

  let documentText: string;
  try {
    documentText = await extractPlainTextFromDocumentBuffer(buffer);
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "NO_TEXT") return { error: "no_text" };
    return { error: "document_read_error" };
  }

  const result = await generateDeckFromContent(
    userId,
    { contentText: documentText },
    { hasUnlimitedDecks: true },
  );

  if ("error" in result) {
    return { error: result.error };
  }

  return result;
}
