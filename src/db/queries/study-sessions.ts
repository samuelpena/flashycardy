import { db } from "@/db";
import { studySessions, studySessionCards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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
