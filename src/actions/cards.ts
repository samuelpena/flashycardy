"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import { insertCard, insertCards, updateCard, deleteCard } from "@/db/queries/cards";

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

const deleteCardSchema = z.object({
  cardId: z.number().int().positive(),
  deckId: z.number().int().positive(),
});

type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCardAction(input: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = deleteCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { cardId, deckId } = parsed.data;

  const deck = await getDeckByIdAndUser(deckId, userId);
  if (!deck) return { error: "Deck not found" };

  const card = deck.cards.find((c) => c.id === cardId);
  if (!card) return { error: "Card not found" };

  await deleteCard(cardId);

  revalidatePath(`/decks/${deckId}`);
  return { success: true };
}

const generateCardsSchema = z.object({
  deckId: z.number().int().positive(),
});

type GenerateCardsInput = z.infer<typeof generateCardsSchema>;

export async function generateCardsAction(input: GenerateCardsInput) {
  const { userId, has } = await auth();
  if (!userId) return { error: "Unauthorized" };

  if (!has({ feature: "ai_flashcard_generation" })) {
    return { error: "AI flashcard generation requires a Pro plan." };
  }

  const parsed = generateCardsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckId } = parsed.data;

  const deck = await getDeckByIdAndUser(deckId, userId);
  if (!deck) return { error: "Deck not found" };

  const cardSchema = z.object({
    cards: z.array(
      z.object({
        front: z.string(),
        back: z.string(),
      }),
    ),
  });

  const { output } = await generateText({
    model: openai("gpt-4.1-nano"),
    output: Output.object({ schema: cardSchema }),
    prompt: `Generate 20 flashcards for a study deck titled "${deck.name}"${deck.description ? ` described as: "${deck.description}"` : ""}. Each card should have a concise question or term on the front and a clear, accurate answer on the back.`,
  });

  if (!output) return { error: "Failed to generate cards. Please try again." };

  await insertCards(
    output.cards.map((card) => ({
      deckId,
      front: card.front,
      back: card.back,
    })),
  );

  revalidatePath(`/decks/${deckId}`);
  return { success: true };
}
