"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { saveStudySessionForUser } from "@/db/queries/study-sessions";

type SaveStudySessionInput = {
  deckUuid: string;
  cardResults: { cardUuid: string; isCorrect: boolean }[];
};

/**
 * Persists the results of a completed study session for a deck.
 *
 * Resolves each card UUID to its numeric primary key, then writes the session
 * summary (total, correct, incorrect counts) and per-card correctness rows in
 * two sequential inserts.
 *
 * @param input - Session payload (deckUuid, cardResults array of `{ cardUuid, isCorrect }`)
 * @returns `{ success: true, sessionUuid }` on success, or `{ error }` if
 *   unauthorized, deck not found, or validation fails
 */
export async function saveStudySessionAction(input: SaveStudySessionInput) {
  const tAct = await getTranslations("Actions");
  const saveStudySessionSchema = z.object({
    deckUuid: z.string().uuid(),
    cardResults: z
      .array(
        z.object({
          cardUuid: z.string().uuid(),
          isCorrect: z.boolean(),
        }),
      )
      .min(1),
  });

  const { userId } = await auth();
  if (!userId) return { error: tAct("unauthorized") };

  const parsed = saveStudySessionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { deckUuid, cardResults } = parsed.data;

  const result = await saveStudySessionForUser({ userId, deckUuid, cardResults });
  if (result.status === "deck-not-found") return { error: tAct("deckNotFound") };

  return { success: true, sessionUuid: result.session.uuid };
}
