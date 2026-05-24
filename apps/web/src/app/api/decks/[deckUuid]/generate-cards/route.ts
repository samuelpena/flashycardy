import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { preflight } from "@/lib/api/cors";
import { jsonData, jsonError } from "@/lib/api/responses";
import { generateCardsForDeck } from "@/lib/decks/generate-cards-for-deck";

export { preflight as OPTIONS };

const deckParamsSchema = z.object({
  deckUuid: z.string().uuid(),
});

export const POST = withAuth<{ deckUuid: string }>(async (_req, { params, userId, has }) => {
  if (!has({ feature: "ai_flashcard_generation" })) {
    return jsonError("AI flashcard generation requires a Pro plan", 403);
  }

  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const { deckUuid } = parsedParams.data;
  const result = await generateCardsForDeck(userId, deckUuid);

  if ("error" in result) {
    switch (result.error) {
      case "deck_not_found":
        return jsonError("Deck not found", 404);
      case "no_description":
        return jsonError("Add a description to your deck before generating cards", 400);
      case "ai_failed":
        return jsonError("Failed to generate cards. Please try again", 500);
      default:
        return jsonError("Failed to generate cards. Please try again", 500);
    }
  }

  revalidatePath(`/decks/${deckUuid}`);
  return jsonData({ success: true });
});
