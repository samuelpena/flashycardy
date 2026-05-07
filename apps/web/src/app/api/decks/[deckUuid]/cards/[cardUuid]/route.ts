import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonData, jsonError } from "@/lib/api/responses";
import { preflight } from "@/lib/api/cors";
import { getDeckByUuidAndUser } from "@/db/queries/decks";
import { deleteCardForUser, updateCardForUser } from "@/db/queries/cards";

export { preflight as OPTIONS };

const cardParamsSchema = z.object({
  deckUuid: z.string().uuid(),
  cardUuid: z.string().uuid(),
});

const replaceCardSchema = z.object({
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

const patchCardSchema = replaceCardSchema.partial().refine(
  (input) => input.front !== undefined || input.back !== undefined,
  "At least one field is required"
);

export const GET = withAuth<{ deckUuid: string; cardUuid: string }>(
  async (_req, { params, userId }) => {
    const parsedParams = cardParamsSchema.safeParse(await params);
    if (!parsedParams.success) return jsonError("Invalid route parameters", 400);

    const { deckUuid, cardUuid } = parsedParams.data;
    const deck = await getDeckByUuidAndUser(deckUuid, userId);
    if (!deck) return jsonError("Deck not found", 404);

    const card = deck.cards.find((row) => row.uuid === cardUuid);
    if (!card) return jsonError("Card not found", 404);

    return jsonData(card);
  }
);

export const PUT = withAuth<{ deckUuid: string; cardUuid: string }>(
  async (req, { params, userId }) => {
    const parsedParams = cardParamsSchema.safeParse(await params);
    if (!parsedParams.success) return jsonError("Invalid route parameters", 400);

    const body = await req.json().catch(() => null);
    const parsedBody = replaceCardSchema.safeParse(body);
    if (!parsedBody.success) return jsonError("Invalid request body", 400);

    const { deckUuid, cardUuid } = parsedParams.data;
    const result = await updateCardForUser(userId, { deckUuid, cardUuid, ...parsedBody.data });
    if (result.status === "deck-not-found") return jsonError("Deck not found", 404);
    if (result.status === "card-not-found") return jsonError("Card not found", 404);

    revalidatePath(`/decks/${deckUuid}`);
    return jsonData(result.card);
  }
);

export const PATCH = withAuth<{ deckUuid: string; cardUuid: string }>(
  async (req, { params, userId }) => {
    const parsedParams = cardParamsSchema.safeParse(await params);
    if (!parsedParams.success) return jsonError("Invalid route parameters", 400);

    const body = await req.json().catch(() => null);
    const parsedBody = patchCardSchema.safeParse(body);
    if (!parsedBody.success) return jsonError("Invalid request body", 400);

    const { deckUuid, cardUuid } = parsedParams.data;
    const deck = await getDeckByUuidAndUser(deckUuid, userId);
    if (!deck) return jsonError("Deck not found", 404);

    const card = deck.cards.find((row) => row.uuid === cardUuid);
    if (!card) return jsonError("Card not found", 404);

    const result = await updateCardForUser(userId, {
      deckUuid,
      cardUuid,
      front: parsedBody.data.front ?? card.front,
      back: parsedBody.data.back ?? card.back,
    });

    if (result.status === "deck-not-found") return jsonError("Deck not found", 404);
    if (result.status === "card-not-found") return jsonError("Card not found", 404);

    revalidatePath(`/decks/${deckUuid}`);
    return jsonData(result.card);
  }
);

export const DELETE = withAuth<{ deckUuid: string; cardUuid: string }>(
  async (_req, { params, userId }) => {
    const parsedParams = cardParamsSchema.safeParse(await params);
    if (!parsedParams.success) return jsonError("Invalid route parameters", 400);

    const { deckUuid, cardUuid } = parsedParams.data;
    const result = await deleteCardForUser(userId, { deckUuid, cardUuid });
    if (result.status === "deck-not-found") return jsonError("Deck not found", 404);
    if (result.status === "card-not-found") return jsonError("Card not found", 404);

    revalidatePath(`/decks/${deckUuid}`);
    return jsonData(result.card);
  }
);
