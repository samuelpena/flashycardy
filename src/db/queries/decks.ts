import { db } from "@/db";
import { insertCards } from "@/db/queries/cards";
import { cards, decks } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";

export async function getDecksByUser(userId: string) {
  return db
    .select({
      id: decks.id,
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

export async function getDeckByIdAndUser(deckId: number, userId: string) {
  return db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)),
    with: { cards: true },
  });
}

export async function insertDeck(values: typeof decks.$inferInsert) {
  return db.insert(decks).values(values).returning();
}

/** Neon HTTP driver has no `db.transaction()` — insert deck then cards, rollback deck on failure. */
export async function insertDeckWithCards(
  deckValues: typeof decks.$inferInsert,
  cardRows: { front: string; back: string }[],
) {
  const inserted = await insertDeck(deckValues);
  const [deck] = inserted;
  if (!deck) return null;

  try {
    if (cardRows.length > 0) {
      await insertCards(
        cardRows.map((c) => ({
          deckId: deck.id,
          front: c.front,
          back: c.back,
        })),
      );
    }
    return deck;
  } catch {
    await deleteDeckByIdAndUser(deck.id, deckValues.clerkUserId);
    return null;
  }
}

export async function updateDeck(
  deckId: number,
  userId: string,
  values: Partial<typeof decks.$inferInsert>
) {
  return db
    .update(decks)
    .set(values)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)))
    .returning();
}

export async function getDeckCountByUser(userId: string) {
  const [result] = await db
    .select({ count: count(decks.id) })
    .from(decks)
    .where(eq(decks.clerkUserId, userId));
  return result?.count ?? 0;
}

export async function deleteDeckByIdAndUser(deckId: number, userId: string) {
  return db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)))
    .returning();
}
