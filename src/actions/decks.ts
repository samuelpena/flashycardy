"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateDeck } from "@/db/queries/decks";

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
