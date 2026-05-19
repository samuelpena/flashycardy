import { z } from "zod";
import { updateDeckByUuid } from "@/db/queries/decks";
import type { McpToolContext } from "@/lib/mcp/tool-context";
import { mcpJsonContent, mcpToolError } from "@/lib/mcp/tool-result";

export const patchDeckInputSchema = z
  .object({
    deckUuid: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
  })
  .refine((v) => v.name !== undefined || v.description !== undefined, {
    message: "At least one of name or description is required",
  });

export type PatchDeckInput = z.infer<typeof patchDeckInputSchema>;

/**
 * Partial deck update (`PATCH /api/decks/[deckUuid]`).
 *
 * @param ctx - Authenticated user context
 * @param input - Deck UUID and fields to patch
 */
export async function runPatchDeck(ctx: McpToolContext, input: PatchDeckInput) {
  const values: { name?: string; description?: string | null } = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.description !== undefined) values.description = input.description ?? null;

  const [deck] = await updateDeckByUuid(input.deckUuid, ctx.userId, values);
  if (!deck) return mcpToolError("Deck not found");
  return mcpJsonContent({ data: deck });
}
