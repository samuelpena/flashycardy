import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function insertCard(values: typeof cards.$inferInsert) {
  return db.insert(cards).values(values).returning();
}

export async function insertCards(values: (typeof cards.$inferInsert)[]) {
  return db.insert(cards).values(values).returning();
}

export async function updateCard(
  cardId: number,
  deckId: number,
  values: Partial<Pick<typeof cards.$inferInsert, "front" | "back">>
) {
  return db
    .update(cards)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
    .returning();
}

export async function deleteCard(cardId: number, deckId: number) {
  return db
    .delete(cards)
    .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)));
}
