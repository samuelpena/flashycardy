import { z } from "zod";
import { saveStudySessionForUser } from "@/db/queries/study-sessions";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const createStudySessionInputSchema = z.object({
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

export type CreateStudySessionInput = z.infer<typeof createStudySessionInputSchema>;

/**
 * Persists a study session (`POST /api/study-sessions`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and per-card results
 */
export async function runCreateStudySession(
  ctx: McpToolContext,
  input: CreateStudySessionInput
) {
  const result = await saveStudySessionForUser({
    userId: ctx.userId,
    deckUuid: input.deckUuid,
    cardResults: input.cardResults,
  });
  if (result.status === "deck-not-found") return mcpToolError("Deck not found");
  return mcpJsonContent({ data: result.session });
}
