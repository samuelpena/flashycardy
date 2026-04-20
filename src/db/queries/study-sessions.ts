import { db } from "@/db";
import { studySessions, studySessionCards, decks, cards } from "@/db/schema";
import { eq, desc, and, isNotNull, sql, count } from "drizzle-orm";

export async function insertStudySession(values: {
  clerkUserId: string;
  deckUuid: string;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
}) {
  const deck = await db.query.decks.findFirst({
    where: eq(decks.uuid, values.deckUuid),
    columns: { id: true },
  });
  if (!deck) throw new Error("Deck not found");

  const [session] = await db
    .insert(studySessions)
    .values({
      clerkUserId: values.clerkUserId,
      deckId: deck.id,
      totalCards: values.totalCards,
      correctCount: values.correctCount,
      incorrectCount: values.incorrectCount,
    })
    .returning();
  return session;
}

export async function insertStudySessionCards(
  values: (typeof studySessionCards.$inferInsert)[]
) {
  return db.insert(studySessionCards).values(values).returning();
}

export async function getCardRatingsByDeck(deckUuid: string, userId: string) {
  return db
    .select({
      cardUuid: cards.uuid,
      correctCount: sql<number>`count(*) filter (where ${studySessionCards.isCorrect} = true)`
        .mapWith(Number),
      incorrectCount: sql<number>`count(*) filter (where ${studySessionCards.isCorrect} = false)`
        .mapWith(Number),
    })
    .from(studySessionCards)
    .innerJoin(studySessions, eq(studySessionCards.sessionId, studySessions.id))
    .innerJoin(cards, eq(studySessionCards.cardId, cards.id))
    .innerJoin(decks, eq(studySessions.deckId, decks.id))
    .where(
      and(
        eq(studySessions.clerkUserId, userId),
        eq(decks.uuid, deckUuid),
        isNotNull(studySessionCards.cardId),
      )
    )
    .groupBy(cards.uuid);
}

export async function getStudySessionCountsByUser(userId: string) {
  return db
    .select({
      deckUuid: decks.uuid,
      sessionCount: count(studySessions.id),
    })
    .from(studySessions)
    .innerJoin(decks, eq(studySessions.deckId, decks.id))
    .where(eq(studySessions.clerkUserId, userId))
    .groupBy(decks.uuid);
}

export async function getRecentStudySessionsByUser(
  userId: string,
  limit = 10
) {
  return db.query.studySessions.findMany({
    where: eq(studySessions.clerkUserId, userId),
    with: { deck: true, sessionCards: true },
    orderBy: [desc(studySessions.completedAt)],
    limit,
  });
}

export async function getAllStudySessionsByUser(userId: string) {
  return db.query.studySessions.findMany({
    where: eq(studySessions.clerkUserId, userId),
    with: { deck: true },
    orderBy: [desc(studySessions.completedAt)],
  });
}
