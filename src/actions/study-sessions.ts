"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getDeckByIdAndUser } from "@/db/queries/decks";
import {
  insertStudySession,
  insertStudySessionCards,
} from "@/db/queries/study-sessions";

const saveStudySessionSchema = z.object({
  deckId: z.number().int().positive(),
  cardResults: z
    .array(
      z.object({
        cardId: z.number().int().positive(),
        isCorrect: z.boolean(),
      })
    )
    .min(1),
});

type SaveStudySessionInput = z.infer<typeof saveStudySessionSchema>;

export async function saveStudySessionAction(input: SaveStudySessionInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = saveStudySessionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckId, cardResults } = parsed.data;

  const deck = await getDeckByIdAndUser(deckId, userId);
  if (!deck) return { error: "Deck not found" };

  const correctCount = cardResults.filter((r) => r.isCorrect).length;
  const incorrectCount = cardResults.filter((r) => !r.isCorrect).length;

  const session = await insertStudySession({
    clerkUserId: userId,
    deckId,
    totalCards: cardResults.length,
    correctCount,
    incorrectCount,
  });

  await insertStudySessionCards(
    cardResults.map((r) => ({
      sessionId: session.id,
      cardId: r.cardId,
      isCorrect: r.isCorrect,
    }))
  );

  return { success: true, sessionId: session.id };
}
