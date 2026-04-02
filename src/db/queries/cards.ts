import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function insertCard(values: typeof cards.$inferInsert) {
  return db.insert(cards).values(values).returning();
}

export async function updateCard(
  cardId: number,
  values: Partial<Pick<typeof cards.$inferInsert, "front" | "back">>
) {
  return db
    .update(cards)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(cards.id, cardId))
    .returning();
}

export async function deleteCard(cardId: number) {
  return db.delete(cards).where(eq(cards.id, cardId));
}
