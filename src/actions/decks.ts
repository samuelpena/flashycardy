"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteDeckByIdAndUser, insertDeck, updateDeck } from "@/db/queries/decks";

const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = createDeckSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { name, description } = parsed.data;

  await insertDeck({ clerkUserId: userId, name, description: description ?? null });

  revalidatePath("/dashboard");
  return { success: true };
}

const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = updateDeckSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckId, name, description } = parsed.data;

  const updated = await updateDeck(deckId, userId, {
    name,
    description: description ?? null,
  });

  if (!updated.length) return { error: "Deck not found" };

  revalidatePath(`/decks/${deckId}`);
  return { success: true };
}

const deleteDeckSchema = z.object({
  deckId: z.number().int().positive(),
});

type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeckAction(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = deleteDeckSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckId } = parsed.data;

  const deleted = await deleteDeckByIdAndUser(deckId, userId);
  if (!deleted.length) return { error: "Deck not found" };

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckId}`);
  return { success: true };
}
