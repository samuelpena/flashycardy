import { withAuth } from "@/lib/api/with-auth";
import { jsonData } from "@/lib/api/responses";
import { preflight } from "@/lib/api/cors";
import { getDeckCountByUser } from "@/db/queries/decks";

export { preflight as OPTIONS };

export const GET = withAuth(async (_req, { userId }) => {
  const count = await getDeckCountByUser(userId);
  return jsonData({ count });
});
