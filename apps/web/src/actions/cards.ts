"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import {
  deleteCardForUser,
  insertCardForUser,
  updateCardForUser,
} from "@/db/queries/cards";
import { generateCardsForDeck } from "@/lib/decks/generate-cards-for-deck";

type CreateCardInput = { deckUuid: string; front: string; back: string };

/**
 * Creates a new flashcard in a deck owned by the current user.
 *
 * @param input - Card creation payload (deckUuid, front, back)
 * @returns `{ success: true }` on success, or `{ error }` on failure
 * @throws Never — errors are returned as `{ error }` response objects
 */
export async function createCardAction(input: CreateCardInput) {
  const tVal = await getTranslations("Validation");
  const tAct = await getTranslations("Actions");
  const createCardSchema = z.object({
    deckUuid: z.string().uuid(),
    front: z.string().min(1, tVal("frontRequired")),
    back: z.string().min(1, tVal("backRequired")),
  });

  const { userId } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckUuid, front, back } = parsed.data;

  const result = await insertCardForUser(userId, { deckUuid, front, back });
  if (result.status === "deck-not-found") return { error: tAct("deckNotFound") };

  revalidatePath(`/decks/${deckUuid}`);
  return { success: true };
}

type UpdateCardInput = {
  cardUuid: string;
  deckUuid: string;
  front: string;
  back: string;
};

/**
 * Updates the front and back content of an existing card.
 *
 * Verifies the card belongs to a deck owned by the current user before writing.
 *
 * @param input - Update payload (cardUuid, deckUuid, front, back)
 * @returns `{ success: true }` on success, or `{ error }` on failure
 */
export async function updateCardAction(input: UpdateCardInput) {
  const tVal = await getTranslations("Validation");
  const tAct = await getTranslations("Actions");
  const updateCardSchema = z.object({
    cardUuid: z.string().uuid(),
    deckUuid: z.string().uuid(),
    front: z.string().min(1, tVal("frontRequired")),
    back: z.string().min(1, tVal("backRequired")),
  });

  const { userId } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = updateCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { cardUuid, deckUuid, front, back } = parsed.data;

  const result = await updateCardForUser(userId, { cardUuid, deckUuid, front, back });
  if (result.status === "deck-not-found") return { error: tAct("deckNotFound") };
  if (result.status === "card-not-found") return { error: tAct("cardNotFound") };

  revalidatePath(`/decks/${deckUuid}`);
  return { success: true };
}

type DeleteCardInput = { cardUuid: string; deckUuid: string };

/**
 * Permanently deletes a card from a deck.
 *
 * Verifies ownership of both the deck and card before deletion.
 *
 * @param input - Deletion payload (cardUuid, deckUuid)
 * @returns `{ success: true }` on success, or `{ error }` on failure
 */
export async function deleteCardAction(input: DeleteCardInput) {
  const tAct = await getTranslations("Actions");
  const deleteCardSchema = z.object({
    cardUuid: z.string().uuid(),
    deckUuid: z.string().uuid(),
  });

  const { userId } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = deleteCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { cardUuid, deckUuid } = parsed.data;

  const result = await deleteCardForUser(userId, { cardUuid, deckUuid });
  if (result.status === "deck-not-found") return { error: tAct("deckNotFound") };
  if (result.status === "card-not-found") return { error: tAct("cardNotFound") };

  revalidatePath(`/decks/${deckUuid}`);
  return { success: true };
}

type GenerateCardsInput = { deckUuid: string };

/**
 * AI-generates 20 flashcards for a deck using GPT-4.1-nano (Pro feature).
 *
 * Requires the `ai_flashcard_generation` Clerk feature flag. The deck must
 * have a non-empty description for the prompt to be meaningful.
 *
 * @param input - Generation payload (deckUuid)
 * @returns `{ success: true }` on success, or `{ error }` if unauthorized,
 *   feature-gated, or the AI call fails
 */
export async function generateCardsAction(input: GenerateCardsInput) {
  const tAct = await getTranslations("Actions");
  const generateCardsSchema = z.object({
    deckUuid: z.string().uuid(),
  });

  const { userId, has } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  if (!has({ feature: "ai_flashcard_generation" })) {
    return { error: tAct("aiGenProRequired") };
  }

  const parsed = generateCardsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckUuid } = parsed.data;

  const result = await generateCardsForDeck(userId, deckUuid);
  if ("error" in result) {
    if (result.error === "deck_not_found") return { error: tAct("deckNotFound") };
    if (result.error === "no_description") return { error: tAct("addDescriptionFirst") };
    return { error: tAct("generateCardsFailed") };
  }

  revalidatePath(`/decks/${deckUuid}`);
  return { success: true };
}
