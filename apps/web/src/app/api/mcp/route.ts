import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { NextRequest } from "next/server";
import { registerFlashycardyMcpTools } from "@/lib/mcp/register-tools";
import { verifyMcpToken } from "@/lib/mcp/verify-mcp-token";

export const maxDuration = 60;

const mcpCore = createMcpHandler(
  async (server) => {
    await registerFlashycardyMcpTools(server);
  },
  {
    serverInfo: {
      name: "flashycardy",
      version: "0.1.0",
    },
  },
  {
    basePath: "/api",
    maxDuration: 60,
    redisUrl: process.env.REDIS_URL ?? process.env.KV_URL,
    disableSse: true,
  }
);

const authed = withMcpAuth(mcpCore, verifyMcpToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
});

/**
 * Streamable HTTP MCP endpoint (`/api/mcp`). Prefer a Clerk **OAuth access token** in
 * `Authorization: Bearer` (MCP clients); session JWTs from the web app are accepted as a fallback.
 */
export async function GET(req: NextRequest) {
  return authed(req);
}

/** @see GET */
export async function POST(req: NextRequest) {
  return authed(req);
}

/** Ends MCP stream / session cleanup per Vercel MCP adapter. */
export async function DELETE(req: NextRequest) {
  return authed(req);
}
