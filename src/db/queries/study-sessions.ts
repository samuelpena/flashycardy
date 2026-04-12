import { db } from "@/db";
import { studySessions, studySessionCards } from "@/db/schema";
import { eq, desc, and, isNotNull, sql, count } from "drizzle-orm";

export async function insertStudySession(
  values: typeof studySessions.$inferInsert
) {
  const [session] = await db
    .insert(studySessions)
    .values(values)
    .returning();
  return session;
}

export async function insertStudySessionCards(
  values: (typeof studySessionCards.$inferInsert)[]
) {
  return db.insert(studySessionCards).values(values).returning();
}

export async function getStudySessionsByDeck(deckId: number) {
  return db.query.studySessions.findMany({
    where: eq(studySessions.deckId, deckId),
    with: { sessionCards: true },
    orderBy: [desc(studySessions.completedAt)],
  });
}

export async function getCardRatingsByDeck(deckId: number, userId: string) {
  return db
    .select({
      cardId: studySessionCards.cardId,
      correctCount: sql<number>`count(*) filter (where ${studySessionCards.isCorrect} = true)`
        .mapWith(Number),
      incorrectCount: sql<number>`count(*) filter (where ${studySessionCards.isCorrect} = false)`
        .mapWith(Number),
    })
    .from(studySessionCards)
    .innerJoin(studySessions, eq(studySessionCards.sessionId, studySessions.id))
    .where(
      and(
        eq(studySessions.clerkUserId, userId),
        eq(studySessions.deckId, deckId),
        isNotNull(studySessionCards.cardId),
      )
    )
    .groupBy(studySessionCards.cardId);
}

export async function getStudySessionCountsByUser(userId: string) {
  return db
    .select({
      deckId: studySessions.deckId,
      sessionCount: count(studySessions.id),
    })
    .from(studySessions)
    .where(eq(studySessions.clerkUserId, userId))
    .groupBy(studySessions.deckId);
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
