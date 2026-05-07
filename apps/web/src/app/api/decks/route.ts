import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonData, jsonError, jsonPaginatedData } from "@/lib/api/responses";
import { paginationEnvelope, parsePagination } from "@/lib/api/pagination";
import { preflight } from "@/lib/api/cors";
import {
  getDeckCountByUser,
  getDecksByUser,
  insertDeck,
  insertDeckWithCards,
} from "@/db/queries/decks";

export { preflight as OPTIONS };

const FREE_DECK_LIMIT = 3;

const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1, "Front is required"),
        back: z.string().min(1, "Back is required"),
      })
    )
    .optional(),
});

export const GET = withAuth(async (req, { userId }) => {
  const parsedPagination = parsePagination(req.nextUrl.searchParams);
  if (!parsedPagination.success) return parsedPagination.response;

  const decks = await getDecksByUser(userId, parsedPagination.pagination);
  const totalItems = await getDeckCountByUser(userId);
  return jsonPaginatedData(
    decks,
    paginationEnvelope(req.nextUrl, totalItems, parsedPagination.pagination)
  );
});

export const POST = withAuth(async (req, { userId, has }) => {
  const body = await req.json().catch(() => null);
  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request body", 400);

  if (!has({ feature: "unlimited_decks" })) {
    const deckCount = await getDeckCountByUser(userId);
    if (deckCount >= FREE_DECK_LIMIT) {
      return jsonError("Deck limit reached for the free plan", 403);
    }
  }

  const { name, description, cards } = parsed.data;
  const deckValues = {
    clerkUserId: userId,
    name,
    description: description ?? null,
  };

  if (cards?.length) {
    const deck = await insertDeckWithCards(deckValues, cards);
    if (!deck) return jsonError("Failed to create deck", 500);
    return jsonData(deck, 201);
  }

  const [deck] = await insertDeck(deckValues);
  if (!deck) return jsonError("Failed to create deck", 500);

  return jsonData(deck, 201);
});
