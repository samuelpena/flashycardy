import { ApiError } from "@flashycardy/api-client";

/**
 * Maps REST error strings to i18n keys under `Actions`, or returns the API message.
 */
export function mapApiErrorToMessage(
  error: unknown,
  tActions: (key: string, values?: Record<string, string | number>) => string,
): string {
  if (error instanceof ApiError) {
    const msg = error.message;
    const map: Record<string, string> = {
      "Deck limit reached for the free plan": tActions("deckLimitReached"),
      "Document-based deck generation requires a Pro plan": tActions("documentDeckProRequired"),
      "AI flashcard generation requires a Pro plan": tActions("aiGenProRequired"),
      "Unsupported file type. Upload a .pdf, .docx, or .pptx file": tActions("unsupportedFileType"),
      "Invalid file data": tActions("invalidFileData"),
      "File must be non-empty and at most 10 MB": tActions("fileSizeExceeded", { maxMb: 10 }),
      "Could not read any text from this file": tActions("noTextInFile"),
      "Could not read this document": tActions("documentReadError"),
      "Could not generate a deck from this document": tActions("deckGenFailed"),
      "Failed to save the deck": tActions("saveDeckFailed"),
      "Add a description to your deck before generating cards": tActions("addDescriptionFirst"),
      "Failed to generate cards. Please try again": tActions("generateCardsFailed"),
      "Deck not found": tActions("deckNotFound"),
      Unauthorized: tActions("unauthorized"),
    };
    return map[msg] ?? msg;
  }

  if (error instanceof Error) return error.message;
  return tActions("genericError");
}
