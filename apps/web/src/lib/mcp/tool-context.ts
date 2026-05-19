/**
 * Fields derived from Clerk after MCP bearer verification (passed into tool runners).
 */
export type McpToolContext = {
  userId: string;
  hasUnlimitedDecks: boolean;
};
