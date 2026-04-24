import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Inserts a single card into the deck identified by UUID.
 *
 * @param deckUuid - The UUID of the deck to insert the card into
 * @param front - The front (question) text of the card
 * @param back - The back (answer) text of the card
 * @returns The newly inserted card row
 * @throws {Error} When no deck with the given UUID exists
 */
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

/**
 * Inserts multiple cards into the deck identified by UUID.
 *
 * @param deckUuid - The UUID of the deck to insert cards into
 * @param rows - Array of front/back pairs to insert
 * @returns The newly inserted card rows
 * @throws {Error} When no deck with the given UUID exists
 */
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

/**
 * Updates a card's front and/or back text, scoped to the given deck.
 *
 * @param cardUuid - The UUID of the card to update
 * @param deckUuid - The UUID of the deck the card belongs to
 * @param values - Partial set of fields to update (`front`, `back`)
 * @returns The updated card row
 * @throws {Error} When no deck with the given UUID exists
 */
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

/**
 * Deletes a card by UUID, scoped to the given deck.
 *
 * @param cardUuid - The UUID of the card to delete
 * @param deckUuid - The UUID of the deck the card belongs to
 * @throws {Error} When no deck with the given UUID exists
 */
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
