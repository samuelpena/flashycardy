import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonData, jsonDataWithPagination, jsonError } from "@/lib/api/responses";
import { paginationEnvelope, parsePagination } from "@/lib/api/pagination";
import { preflight } from "@/lib/api/cors";
import {
  deleteDeckByUuidAndUser,
  getDeckMetadataByUuidAndUser,
  updateDeckByUuid,
} from "@/db/queries/decks";
import { getCardCountByDeckUuidAndUser, getCardsByDeckUuidAndUser } from "@/db/queries/cards";

export { preflight as OPTIONS };

const deckParamsSchema = z.object({
  deckUuid: z.string().uuid(),
});

const replaceDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

const patchDeckSchema = replaceDeckSchema.partial().refine(
  (input) => input.name !== undefined || input.description !== undefined,
  "At least one field is required"
);

export const GET = withAuth<{ deckUuid: string }>(async (req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const parsedPagination = parsePagination(req.nextUrl.searchParams);
  if (!parsedPagination.success) return parsedPagination.response;

  const deck = await getDeckMetadataByUuidAndUser(parsedParams.data.deckUuid, userId);
  if (!deck) return jsonError("Deck not found", 404);

  const cardsResult = await getCardsByDeckUuidAndUser(
    parsedParams.data.deckUuid,
    userId,
    parsedPagination.pagination
  );
  if (cardsResult.status === "deck-not-found") return jsonError("Deck not found", 404);

  const cardCountResult = await getCardCountByDeckUuidAndUser(
    parsedParams.data.deckUuid,
    userId
  );
  if (cardCountResult.status === "deck-not-found") return jsonError("Deck not found", 404);

  return jsonDataWithPagination(
    { ...deck, cards: cardsResult.cards },
    paginationEnvelope(req.nextUrl, cardCountResult.count, parsedPagination.pagination)
  );
});

export const PUT = withAuth<{ deckUuid: string }>(async (req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const body = await req.json().catch(() => null);
  const parsedBody = replaceDeckSchema.safeParse(body);
  if (!parsedBody.success) return jsonError("Invalid request body", 400);

  const { deckUuid } = parsedParams.data;
  const [deck] = await updateDeckByUuid(deckUuid, userId, {
    name: parsedBody.data.name,
    description: parsedBody.data.description ?? null,
  });

  if (!deck) return jsonError("Deck not found", 404);

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckUuid}`);
  return jsonData(deck);
});

export const PATCH = withAuth<{ deckUuid: string }>(async (req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const body = await req.json().catch(() => null);
  const parsedBody = patchDeckSchema.safeParse(body);
  if (!parsedBody.success) return jsonError("Invalid request body", 400);

  const { deckUuid } = parsedParams.data;
  const values: { name?: string; description?: string | null } = {};
  if (parsedBody.data.name !== undefined) values.name = parsedBody.data.name;
  if (parsedBody.data.description !== undefined) {
    values.description = parsedBody.data.description ?? null;
  }

  const [deck] = await updateDeckByUuid(deckUuid, userId, values);

  if (!deck) return jsonError("Deck not found", 404);

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckUuid}`);
  return jsonData(deck);
});

export const DELETE = withAuth<{ deckUuid: string }>(async (_req, { params, userId }) => {
  const parsedParams = deckParamsSchema.safeParse(await params);
  if (!parsedParams.success) return jsonError("Invalid deck UUID", 400);

  const { deckUuid } = parsedParams.data;
  const [deck] = await deleteDeckByUuidAndUser(deckUuid, userId);
  if (!deck) return jsonError("Deck not found", 404);

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckUuid}`);
  return jsonData(deck);
});
