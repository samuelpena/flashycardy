import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";

/**
 * Returns all decks belonging to a user with their card counts, ordered by creation date.
 *
 * @param userId - Clerk user ID
 * @returns Array of deck rows with a `cardCount` field (empty array if none exist)
 */
export async function getDecksByUser(userId: string) {
  return db
    .select({
      uuid: decks.uuid,
      name: decks.name,
      description: decks.description,
      createdAt: decks.createdAt,
      updatedAt: decks.updatedAt,
      cardCount: count(cards.id),
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .where(eq(decks.clerkUserId, userId))
    .groupBy(decks.id);
}

/**
 * Returns a single deck with all its cards, scoped to the given user.
 *
 * @param deckUuid - The UUID of the deck to retrieve
 * @param userId - Clerk user ID
 * @returns The matching deck with cards, or `undefined` if not found
 */
export async function getDeckByUuidAndUser(deckUuid: string, userId: string) {
  return db.query.decks.findFirst({
    where: and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)),
    with: { cards: true },
  });
}

/**
 * Inserts a new deck row.
 *
 * @param values - Column values for the new deck
 * @returns The newly inserted deck row
 */
export async function insertDeck(values: typeof decks.$inferInsert) {
  return db.insert(decks).values(values).returning();
}

/**
 * Inserts a new deck together with an optional initial set of cards in a single operation.
 *
 * @param deckValues - Column values for the new deck
 * @param cardRows - Array of front/back pairs to insert as cards (may be empty)
 * @returns The newly inserted deck row, or `null` if the insert produced no row
 */
export async function insertDeckWithCards(
  deckValues: typeof decks.$inferInsert,
  cardRows: { front: string; back: string }[]
) {
  const [deck] = await db.insert(decks).values(deckValues).returning();
  if (!deck) return null;
  if (cardRows.length > 0) {
    await db.insert(cards).values(
      cardRows.map((r) => ({ deckId: deck.id, front: r.front, back: r.back }))
    );
  }
  return deck;
}

/**
 * Updates a deck by UUID, scoped to the given user.
 *
 * @param deckUuid - The UUID of the deck to update
 * @param userId - Clerk user ID
 * @param values - Partial set of deck fields to update
 * @returns The updated deck row
 */
export async function updateDeckByUuid(
  deckUuid: string,
  userId: string,
  values: Partial<typeof decks.$inferInsert>
) {
  return db
    .update(decks)
    .set(values)
    .where(and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)))
    .returning();
}

/**
 * Returns the total number of decks owned by a user.
 *
 * @param userId - Clerk user ID
 * @returns The deck count (0 if the user has no decks)
 */
export async function getDeckCountByUser(userId: string) {
  const [result] = await db
    .select({ count: count(decks.id) })
    .from(decks)
    .where(eq(decks.clerkUserId, userId));
  return result?.count ?? 0;
}

/**
 * Deletes a deck by UUID, scoped to the given user.
 *
 * @param deckUuid - The UUID of the deck to delete
 * @param userId - Clerk user ID
 * @returns The deleted deck row
 */
export async function deleteDeckByUuidAndUser(deckUuid: string, userId: string) {
  return db
    .delete(decks)
    .where(and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)))
    .returning();
}
