import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";

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

export async function deleteDeckByIdAndUser(deckId: number, userId: string) {
  return db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)))
    .returning();
}
