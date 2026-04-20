"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import {
  insertStudySession,
  insertStudySessionCards,
} from "@/db/queries/study-sessions";

const saveStudySessionSchema = z.object({
  deckUuid: z.string().uuid(),
  cardResults: z
    .array(
      z.object({
        cardUuid: z.string().uuid(),
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

  const { deckUuid, cardResults } = parsed.data;

  const deck = await getDeckByUuidAndUser(deckUuid, userId);
  if (!deck) return { error: "Deck not found" };

  const cardUuids = cardResults.map((r) => r.cardUuid);
  const cardRows = await db
    .select({ id: cards.id, uuid: cards.uuid })
    .from(cards)
    .where(inArray(cards.uuid, cardUuids));

  const uuidToId = new Map(cardRows.map((c) => [c.uuid, c.id]));

  const correctCount = cardResults.filter((r) => r.isCorrect).length;
  const incorrectCount = cardResults.filter((r) => !r.isCorrect).length;

  const session = await insertStudySession({
    clerkUserId: userId,
    deckUuid,
    totalCards: cardResults.length,
    correctCount,
    incorrectCount,
  });

  await insertStudySessionCards(
    cardResults.map((r) => ({
      sessionId: session.id,
      cardId: uuidToId.get(r.cardUuid) ?? null,
      isCorrect: r.isCorrect,
    }))
  );

  return { success: true, sessionUuid: session.uuid };
}
