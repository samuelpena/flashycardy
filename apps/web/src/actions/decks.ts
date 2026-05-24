"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import {
  deleteDeckByUuidAndUser,
  getDeckCountByUser,
  insertDeck,
  updateDeckByUuid,
} from "@/db/queries/decks";
import { createDeckFromDocument } from "@/lib/decks/create-deck-from-document";

const FREE_DECK_LIMIT = 3;

type CreateDeckInput = { name: string; description?: string };

/**
 * Creates a new deck owned by the current user.
 *
 * Free-plan users are limited to `FREE_DECK_LIMIT` (3) decks. Users with the
 * `unlimited_decks` Clerk feature flag bypass this restriction.
 *
 * @param input - Deck creation payload (name, optional description)
 * @returns `{ success: true }` on success, or `{ error }` if unauthorized,
 *   limit reached, or validation fails
 */
export async function createDeckAction(input: CreateDeckInput) {
  const tVal = await getTranslations("Validation");
  const tAct = await getTranslations("Actions");
  const createDeckSchema = z.object({
    name: z.string().min(1, tVal("nameRequired")).max(255),
    description: z.string().max(1000).optional(),
  });

  const { userId, has } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });

  if (!hasUnlimitedDecks) {
    const deckCount = await getDeckCountByUser(userId);
    if (deckCount >= FREE_DECK_LIMIT) {
      return { error: tAct("deckLimitReached") };
    }
  }

  const { name, description } = parsed.data;

  await insertDeck({ clerkUserId: userId, name, description: description ?? null });

  revalidatePath("/dashboard");
  return { success: true };
}

type CreateDeckFromDocumentInput = { fileBase64: string; fileName: string };

/**
 * Creates a deck and 20 AI-generated flashcards from an uploaded document (Pro feature).
 *
 * Accepts `.pdf`, `.docx`, and `.pptx` files up to 10 MB encoded as base64.
 * Requires the `document_deck_generation` Clerk feature flag. Respects the
 * free-plan deck limit via the `unlimited_decks` flag.
 *
 * @param input - Upload payload (fileBase64, fileName)
 * @returns `{ success: true, deckUuid }` on success, or `{ error }` if
 *   unauthorized, feature-gated, file is invalid, or AI generation fails
 */
export async function createDeckFromDocumentAction(input: CreateDeckFromDocumentInput) {
  const tAct = await getTranslations("Actions");
  const createDeckFromDocumentSchema = z.object({
    fileBase64: z.string().min(1),
    fileName: z.string().min(1).max(255),
  });

  const { userId, has } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  if (!has({ feature: "document_deck_generation" })) {
    return { error: tAct("documentDeckProRequired") };
  }

  const parsed = createDeckFromDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const result = await createDeckFromDocument(userId, parsed.data, {
    hasUnlimitedDecks: has({ feature: "unlimited_decks" }),
  });

  if ("error" in result) {
  if (result.error === "unsupported_file_type") return { error: tAct("unsupportedFileType") };
  if (result.error === "invalid_file_data") return { error: tAct("invalidFileData") };
  if (result.error === "file_size_exceeded") {
    return { error: tAct("fileSizeExceeded", { maxMb: 10 }) };
  }
  if (result.error === "no_text") return { error: tAct("noTextInFile") };
  if (result.error === "document_read_error") return { error: tAct("documentReadError") };
  if (result.error === "deck_limit_reached") return { error: tAct("deckLimitReached") };
  if (result.error === "ai_failed") return { error: tAct("deckGenFailed") };
  if (result.error === "save_failed") return { error: tAct("saveDeckFailed") };
  return { error: tAct("deckGenFailed") };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${result.deckUuid}`);
  return { success: true, deckUuid: result.deckUuid };
}

type UpdateDeckInput = {
  deckUuid: string;
  name: string;
  description?: string;
};

/**
 * Updates the name and description of an existing deck.
 *
 * Scoped to the current user — only decks they own can be updated.
 *
 * @param input - Update payload (deckUuid, name, optional description)
 * @returns `{ success: true }` on success, or `{ error }` if unauthorized,
 *   deck not found, or validation fails
 */
export async function updateDeckAction(input: UpdateDeckInput) {
  const tVal = await getTranslations("Validation");
  const tAct = await getTranslations("Actions");
  const updateDeckSchema = z.object({
    deckUuid: z.string().uuid(),
    name: z.string().min(1, tVal("nameRequired")).max(255),
    description: z.string().max(1000).optional(),
  });

  const { userId } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = updateDeckSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckUuid, name, description } = parsed.data;

  const updated = await updateDeckByUuid(deckUuid, userId, {
    name,
    description: description ?? null,
  });

  if (!updated.length) return { error: tAct("deckNotFound") };

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckUuid}`);
  return { success: true };
}

type DeleteDeckInput = { deckUuid: string };

/**
 * Permanently deletes a deck and all its associated cards.
 *
 * Scoped to the current user — only decks they own can be deleted.
 *
 * @param input - Deletion payload (deckUuid)
 * @returns `{ success: true }` on success, or `{ error }` if unauthorized
 *   or the deck is not found
 */
export async function deleteDeckAction(input: DeleteDeckInput) {
  const tAct = await getTranslations("Actions");
  const deleteDeckSchema = z.object({
    deckUuid: z.string().uuid(),
  });

  const { userId } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = deleteDeckSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckUuid } = parsed.data;

  const deleted = await deleteDeckByUuidAndUser(deckUuid, userId);
  if (!deleted.length) return { error: tAct("deckNotFound") };

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckUuid}`);
  return { success: true };
}
