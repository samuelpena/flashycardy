import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";

const mcpAuthExtraSchema = z.object({
  userId: z.string(),
  hasUnlimitedDecks: z.boolean(),
  hasAiFlashcardGeneration: z.boolean(),
  hasDocumentDeckGeneration: z.boolean(),
});

export type McpAuthExtra = z.infer<typeof mcpAuthExtraSchema>;

/**
 * Parses Clerk-derived fields stored on MCP `AuthInfo.extra` after bearer verification.
 *
 * @param authInfo - Auth payload from `withMcpAuth` / tool `extra.authInfo`
 * @returns Parsed extra or `null` when missing or invalid
 */
export function parseMcpAuthExtra(authInfo: AuthInfo | undefined): McpAuthExtra | null {
  if (!authInfo?.extra) return null;
  const parsed = mcpAuthExtraSchema.safeParse(authInfo.extra);
  return parsed.success ? parsed.data : null;
}
