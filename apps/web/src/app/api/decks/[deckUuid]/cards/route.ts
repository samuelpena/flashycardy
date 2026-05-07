import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonData, jsonError, jsonPaginatedData } from "@/lib/api/responses";
import { paginationEnvelope, parsePagination } from "@/lib/api/pagination";
import { preflight } from "@/lib/api/cors";
import {
  getCardCountByDeckUuidAndUser,
  getCardsByDeckUuidAndUser,
  insertCardForUser,
} from "@/db/queries/cards";

export { preflight as OPTIONS };

const deckParamsSchema = z.object({
  deckUuid: z.string().uuid(),
});

const createCardSchema = z.object({
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

export const GET = withAuth<{ deckUuid: string }>(async (req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const parsedPagination = parsePagination(req.nextUrl.searchParams);
  if (!parsedPagination.success) return parsedPagination.response;

  const result = await getCardsByDeckUuidAndUser(
    parsedParams.data.deckUuid,
    userId,
    parsedPagination.pagination
  );
  if (result.status === "deck-not-found") return jsonError("Deck not found", 404);

  const countResult = await getCardCountByDeckUuidAndUser(
    parsedParams.data.deckUuid,
    userId
  );
  if (countResult.status === "deck-not-found") return jsonError("Deck not found", 404);

  return jsonPaginatedData(
    result.cards,
    paginationEnvelope(req.nextUrl, countResult.count, parsedPagination.pagination)
  );
});

export const POST = withAuth<{ deckUuid: string }>(async (req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const body = await req.json().catch(() => null);
  const parsedBody = createCardSchema.safeParse(body);
  if (!parsedBody.success) return jsonError("Invalid request body", 400);

  const { deckUuid } = parsedParams.data;
  const result = await insertCardForUser(userId, { deckUuid, ...parsedBody.data });
  if (result.status === "deck-not-found") return jsonError("Deck not found", 404);
  if (result.status === "card-not-found") return jsonError("Card not found", 404);

  revalidatePath(`/decks/${deckUuid}`);
  return jsonData(result.card, 201);
});
