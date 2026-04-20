import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function insertCard({
  deckUuid,
  front,
  back,
}: {
  deckUuid: string;
  front: string;
  back: string;
}) {
  const deck = await db.query.decks.findFirst({
    where: eq(decks.uuid, deckUuid),
    columns: { id: true },
  });
  if (!deck) throw new Error("Deck not found");
  return db.insert(cards).values({ deckId: deck.id, front, back }).returning();
}

export async function insertCards(
  deckUuid: string,
  rows: { front: string; back: string }[]
) {
  const deck = await db.query.decks.findFirst({
    where: eq(decks.uuid, deckUuid),
    columns: { id: true },
  });
  if (!deck) throw new Error("Deck not found");
  return db
    .insert(cards)
    .values(rows.map((r) => ({ deckId: deck.id, front: r.front, back: r.back })))
    .returning();
}

export async function updateCardByUuid(
  cardUuid: string,
  deckUuid: string,
  values: Partial<Pick<typeof cards.$inferInsert, "front" | "back">>
) {
  const deck = await db.query.decks.findFirst({
    where: eq(decks.uuid, deckUuid),
    columns: { id: true },
  });
  if (!deck) throw new Error("Deck not found");
  return db
    .update(cards)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(cards.uuid, cardUuid), eq(cards.deckId, deck.id)))
    .returning();
}

export async function deleteCardByUuid(cardUuid: string, deckUuid: string) {
  const deck = await db.query.decks.findFirst({
    where: eq(decks.uuid, deckUuid),
    columns: { id: true },
  });
  if (!deck) throw new Error("Deck not found");
  return db
    .delete(cards)
    .where(and(eq(cards.uuid, cardUuid), eq(cards.deckId, deck.id)));
}
