import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandlerClerk,
} from "@clerk/mcp-tools/next";

const handler = protectedResourceHandlerClerk({
  scopes_supported: ["profile", "email"],
});

/**
 * OAuth 2.0 protected resource metadata for this MCP server (RFC 9728).
 * Path matches Clerk’s MCP guide: `/.well-known/oauth-protected-resource/mcp`.
 */
export function GET(req: Request) {
  return handler(req);
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
