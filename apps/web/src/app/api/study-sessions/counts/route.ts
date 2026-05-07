import { withAuth } from "@/lib/api/with-auth";
import { jsonPaginatedData } from "@/lib/api/responses";
import { paginationEnvelope, parsePagination } from "@/lib/api/pagination";
import { preflight } from "@/lib/api/cors";
import {
  getStudySessionCountsByUser,
  getStudySessionDeckCountByUser,
} from "@/db/queries/study-sessions";

export { preflight as OPTIONS };

export const GET = withAuth(async (req, { userId }) => {
  const parsedPagination = parsePagination(req.nextUrl.searchParams);
  if (!parsedPagination.success) return parsedPagination.response;

  const counts = await getStudySessionCountsByUser(userId, parsedPagination.pagination);
  const totalItems = await getStudySessionDeckCountByUser(userId);
  return jsonPaginatedData(
    counts,
    paginationEnvelope(req.nextUrl, totalItems, parsedPagination.pagination)
  );
});
