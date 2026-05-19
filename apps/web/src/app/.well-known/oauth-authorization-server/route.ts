import {
  authServerMetadataHandlerClerk,
  metadataCorsOptionsRequestHandler,
} from "@clerk/mcp-tools/next";

const handler = authServerMetadataHandlerClerk();

/**
 * OAuth 2.0 authorization server metadata (RFC 8414) for legacy MCP clients.
 */
export async function GET() {
  return handler();
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
