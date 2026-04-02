"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { insertCard, updateCard } from "@/db/queries/cards";

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCardAction(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckId, front, back } = parsed.data;

  const deck = await getDeckByIdAndUser(deckId, userId);
  if (!deck) return { error: "Deck not found" };

  await insertCard({ deckId, front, back });

  revalidatePath(`/decks/${deckId}`);
  return { success: true };
}

const updateCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCardAction(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = updateCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { cardId, deckId, front, back } = parsed.data;

  const deck = await getDeckByIdAndUser(deckId, userId);
  if (!deck) return { error: "Deck not found" };

  const card = deck.cards.find((c) => c.id === cardId);
  if (!card) return { error: "Card not found" };

  await updateCard(cardId, { front, back });

  revalidatePath(`/decks/${deckId}`);
  return { success: true };
}
