import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonData, jsonError, jsonPaginatedData } from "@/lib/api/responses";
import { paginationEnvelope, parsePagination } from "@/lib/api/pagination";
import { preflight } from "@/lib/api/cors";
import {
  getAllStudySessionsByUser,
  getStudySessionCountByUser,
  saveStudySessionForUser,
} from "@/db/queries/study-sessions";

export { preflight as OPTIONS };

const saveStudySessionSchema = z.object({
  deckUuid: z.string().uuid(),
  cardResults: z
    .array(
      z.object({
        cardUuid: z.string().uuid(),
        isCorrect: z.boolean(),
      })
    )
    .min(1),
});

export const GET = withAuth(async (req, { userId }) => {
  const parsedPagination = parsePagination(req.nextUrl.searchParams);
  if (!parsedPagination.success) return parsedPagination.response;

  const sessions = await getAllStudySessionsByUser(userId, parsedPagination.pagination);
  const totalItems = await getStudySessionCountByUser(userId);
  return jsonPaginatedData(
    sessions,
    paginationEnvelope(req.nextUrl, totalItems, parsedPagination.pagination)
  );
});

export const POST = withAuth(async (req, { userId }) => {
  const body = await req.json().catch(() => null);
  const parsed = saveStudySessionSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request body", 400);

  const result = await saveStudySessionForUser({ userId, ...parsed.data });
  if (result.status === "deck-not-found") return jsonError("Deck not found", 404);

  return jsonData(result.session, 201);
});
