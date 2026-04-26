import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonPaginatedData } from "@/lib/api/responses";
import { paginationEnvelope, parsePagination } from "@/lib/api/pagination";
import { preflight } from "@/lib/api/cors";
import { getDeckMetadataByUuidAndUser } from "@/db/queries/decks";
import {
  getCardRatingsByDeck,
  getCardRatingsCountByDeck,
} from "@/db/queries/study-sessions";

export { preflight as OPTIONS };

const deckParamsSchema = z.object({
  deckUuid: z.string().uuid(),
});

export const GET = withAuth<{ deckUuid: string }>(async (req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const parsedPagination = parsePagination(req.nextUrl.searchParams);
  if (!parsedPagination.success) return parsedPagination.response;

  const { deckUuid } = parsedParams.data;
  const deck = await getDeckMetadataByUuidAndUser(deckUuid, userId);
  if (!deck) return jsonError("Deck not found", 404);

  const ratings = await getCardRatingsByDeck(deckUuid, userId, parsedPagination.pagination);
  const totalItems = await getCardRatingsCountByDeck(deckUuid, userId);
  return jsonPaginatedData(
    ratings,
    paginationEnvelope(req.nextUrl, totalItems, parsedPagination.pagination)
  );
});
