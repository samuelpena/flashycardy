import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

type Pagination = {
  limit: number;
  offset: number;
};

type CardMutationResult<T = typeof cards.$inferSelect> =
  | { status: "success"; card: T }
  | { status: "deck-not-found" }
  | { status: "card-not-found" };

/**
 * Returns cards from a deck owned by the given user.
 *
 * @param deckUuid - UUID of the deck to read
 * @param userId - Clerk user ID used to scope the deck
 * @param pagination - Limit and offset for the card list
 * @returns Status plus paginated card rows when successful
 */
export async function getCardsByDeckUuidAndUser(
  deckUuid: string,
  userId: string,
  pagination: Pagination
): Promise<
  | { status: "success"; cards: (typeof cards.$inferSelect)[] }
  | { status: "deck-not-found" }
> {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)),
    columns: { id: true },
  });

  if (!deck) return { status: "deck-not-found" };

  const cardRows = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deck.id))
    .orderBy(desc(cards.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { status: "success", cards: cardRows };
}

/**
 * Returns the number of cards in a deck owned by the given user.
 *
 * @param deckUuid - UUID of the deck to count cards for
 * @param userId - Clerk user ID used to scope the deck
 * @returns Status plus card count when successful
 */
export async function getCardCountByDeckUuidAndUser(
  deckUuid: string,
  userId: string
): Promise<{ status: "success"; count: number } | { status: "deck-not-found" }> {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.uuid, deckUuid), eq(decks.clerkUserId, userId)),
    columns: { id: true },
  });

  if (!deck) return { status: "deck-not-found" };

  const [result] = await db
    .select({ count: count(cards.id) })
    .from(cards)
    .where(eq(cards.deckId, deck.id));

  return { status: "success", count: result?.count ?? 0 };
}

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
 * Inserts a card into a deck owned by the given user.
 *
 * @param userId - Clerk user ID used to scope the deck
 * @param input - Deck UUID and card text
 * @returns Status plus the inserted card when successful
 */
export async function insertCardForUser(
  userId: string,
  input: { deckUuid: string; front: string; back: string }
): Promise<CardMutationResult> {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.uuid, input.deckUuid), eq(decks.clerkUserId, userId)),
    columns: { id: true },
  });

  if (!deck) return { status: "deck-not-found" };

  const [card] = await db
    .insert(cards)
    .values({ deckId: deck.id, front: input.front, back: input.back })
    .returning();

  if (!card) throw new Error("Failed to insert card");

  return { status: "success", card };
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
 * Updates a card in a deck owned by the given user.
 *
 * @param userId - Clerk user ID used to scope the deck
 * @param input - Card UUID, deck UUID, and replacement text
 * @returns Status plus the updated card when successful
 */
export async function updateCardForUser(
  userId: string,
  input: { cardUuid: string; deckUuid: string; front: string; back: string }
): Promise<CardMutationResult> {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.uuid, input.deckUuid), eq(decks.clerkUserId, userId)),
    columns: { id: true },
  });

  if (!deck) return { status: "deck-not-found" };

  const [card] = await db
    .update(cards)
    .set({ front: input.front, back: input.back, updatedAt: new Date() })
    .where(and(eq(cards.uuid, input.cardUuid), eq(cards.deckId, deck.id)))
    .returning();

  if (!card) return { status: "card-not-found" };

  return { status: "success", card };
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

/**
 * Deletes a card from a deck owned by the given user.
 *
 * @param userId - Clerk user ID used to scope the deck
 * @param input - Card UUID and deck UUID
 * @returns Status plus the deleted card when successful
 */
export async function deleteCardForUser(
  userId: string,
  input: { cardUuid: string; deckUuid: string }
): Promise<CardMutationResult> {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.uuid, input.deckUuid), eq(decks.clerkUserId, userId)),
    columns: { id: true },
  });

  if (!deck) return { status: "deck-not-found" };

  const [card] = await db
    .delete(cards)
    .where(and(eq(cards.uuid, input.cardUuid), eq(cards.deckId, deck.id)))
    .returning();

  if (!card) return { status: "card-not-found" };

  return { status: "success", card };
}
