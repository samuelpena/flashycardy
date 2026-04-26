import { db } from "@/db";
import { studySessions, studySessionCards, decks, cards } from "@/db/schema";
import { eq, desc, and, isNotNull, sql, count, inArray } from "drizzle-orm";

type CardResult = {
  cardUuid: string;
  isCorrect: boolean;
};

type SaveStudySessionResult =
  | { status: "success"; session: typeof studySessions.$inferSelect }
  | { status: "deck-not-found" };

/**
 * Inserts a completed study session record, resolving the deck UUID to its internal ID.
 *
 * @param values.clerkUserId - Clerk user ID of the learner
 * @param values.deckUuid - UUID of the deck that was studied
 * @param values.totalCards - Total number of cards shown in the session
 * @param values.correctCount - Number of cards answered correctly
 * @param values.incorrectCount - Number of cards answered incorrectly
 * @returns The newly inserted study session row
 * @throws {Error} When no deck with the given UUID exists
 */
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

/**
 * Inserts per-card result rows for a study session.
 *
 * @param values - Array of study session card records to insert
 * @returns The newly inserted study session card rows
 */
export async function insertStudySessionCards(
  values: (typeof studySessionCards.$inferInsert)[]
) {
  return db.insert(studySessionCards).values(values).returning();
}

/**
 * Persists a completed study session for a deck owned by the given user.
 *
 * Resolves card UUIDs within the same deck before storing per-card results, so
 * future API routes and server actions share one ownership boundary.
 *
 * @param values.userId - Clerk user ID of the learner
 * @param values.deckUuid - UUID of the studied deck
 * @param values.cardResults - Per-card correctness results
 * @returns Status plus the inserted session when successful
 */
export async function saveStudySessionForUser(values: {
  userId: string;
  deckUuid: string;
  cardResults: CardResult[];
}): Promise<SaveStudySessionResult> {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.uuid, values.deckUuid), eq(decks.clerkUserId, values.userId)),
    columns: { id: true },
  });

  if (!deck) return { status: "deck-not-found" };

  const cardUuids = values.cardResults.map((result) => result.cardUuid);
  const cardRows = await db
    .select({ id: cards.id, uuid: cards.uuid })
    .from(cards)
    .where(and(eq(cards.deckId, deck.id), inArray(cards.uuid, cardUuids)));

  const uuidToId = new Map(cardRows.map((card) => [card.uuid, card.id]));
  const correctCount = values.cardResults.filter((result) => result.isCorrect).length;
  const incorrectCount = values.cardResults.length - correctCount;

  const [session] = await db
    .insert(studySessions)
    .values({
      clerkUserId: values.userId,
      deckId: deck.id,
      totalCards: values.cardResults.length,
      correctCount,
      incorrectCount,
    })
    .returning();

  if (!session) throw new Error("Failed to insert study session");

  await db.insert(studySessionCards).values(
    values.cardResults.map((result) => ({
      sessionId: session.id,
      cardId: uuidToId.get(result.cardUuid) ?? null,
      isCorrect: result.isCorrect,
    }))
  );

  return { status: "success", session };
}

/**
 * Returns aggregated correct and incorrect answer counts for each card in a deck.
 *
 * @param deckUuid - UUID of the deck to aggregate ratings for
 * @param userId - Clerk user ID used to scope results to the current user
 * @returns Array of `{ cardUuid, correctCount, incorrectCount }` rows
 */
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

/**
 * Returns the total number of study sessions per deck for a user.
 *
 * @param userId - Clerk user ID
 * @returns Array of `{ deckUuid, sessionCount }` rows
 */
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

/**
 * Returns the most recent study sessions for a user, including deck and card details.
 *
 * @param userId - Clerk user ID
 * @param limit - Maximum number of sessions to return (defaults to 10)
 * @returns Array of study session rows ordered by completion date descending
 */
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

/**
 * Returns all study sessions for a user with their associated deck, ordered by completion date.
 *
 * @param userId - Clerk user ID
 * @returns Array of study session rows ordered by completion date descending
 */
export async function getAllStudySessionsByUser(userId: string) {
  return db.query.studySessions.findMany({
    where: eq(studySessions.clerkUserId, userId),
    with: { deck: true },
    orderBy: [desc(studySessions.completedAt)],
  });
}
