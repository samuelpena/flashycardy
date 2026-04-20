import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";

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

export async function getDeckByUuidAndUser(deckUuid: string, userId: string) {
  return db.query.decks.findFirst({
    where: and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)),
    with: { cards: true },
  });
}

export async function insertDeck(values: typeof decks.$inferInsert) {
  return db.insert(decks).values(values).returning();
}

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

export async function getDeckCountByUser(userId: string) {
  const [result] = await db
    .select({ count: count(decks.id) })
    .from(decks)
    .where(eq(decks.clerkUserId, userId));
  return result?.count ?? 0;
}

export async function deleteDeckByUuidAndUser(deckUuid: string, userId: string) {
  return db
    .delete(decks)
    .where(and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)))
    .returning();
}
