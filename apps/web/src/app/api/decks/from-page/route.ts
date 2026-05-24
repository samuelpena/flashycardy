import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { preflight } from "@/lib/api/cors";
import { jsonData, jsonError } from "@/lib/api/responses";
import { generateDeckFromContent } from "@/lib/decks/generate-deck-from-content";

export { preflight as OPTIONS };

const createFromPageSchema = z.object({
  pageText: z.string().min(100).max(50_000),
  pageUrl: z.string().url().optional(),
  pageTitle: z.string().max(255).optional(),
});

export const POST = withAuth(async (req, { userId, has }) => {
  if (!has({ feature: "document_deck_generation" })) {
    return jsonError("Document-based deck generation requires a Pro plan", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = createFromPageSchema.safeParse(body);
  if (!parsed.success) {
    const tooShort = parsed.error.issues.some(
      (issue) => issue.path[0] === "pageText" && issue.code === "too_small",
    );
    if (tooShort) {
      return jsonError("This page does not have enough text to generate a deck", 400);
    }
    return jsonError("Invalid request body", 400);
  }

  const { pageText, pageUrl, pageTitle } = parsed.data;
  const result = await generateDeckFromContent(
    userId,
    { contentText: pageText, pageUrl, pageTitle },
    { hasUnlimitedDecks: has({ feature: "unlimited_decks" }) },
  );

  if ("error" in result) {
    switch (result.error) {
      case "deck_limit_reached":
        return jsonError("Deck limit reached for the free plan", 403);
      case "ai_failed":
        return jsonError("Could not generate a deck from this page. Try again", 500);
      case "save_failed":
        return jsonError("Failed to save the deck", 500);
      default:
        return jsonError("Could not generate a deck from this page. Try again", 500);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${result.deckUuid}`);
  return jsonData({ deckUuid: result.deckUuid }, 201);
});
