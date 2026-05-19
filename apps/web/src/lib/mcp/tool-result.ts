/** MCP tool handler return shape (success or error). */
export type McpToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

/**
 * Builds MCP tool JSON text content (REST-shaped payloads are JSON-stringified).
 *
 * @param data - Serializable value to return to the client
 * @returns MCP `CallToolResult` fragment with a single text part
 */
export function mcpJsonContent(data: unknown): McpToolResult {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Returns an MCP tool error (client-visible message, `isError: true`).
 *
 * @param message - Human-readable error
 */
export function mcpToolError(message: string): McpToolResult {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}
