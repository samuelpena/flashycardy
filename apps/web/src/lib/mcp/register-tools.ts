import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";
import { parseMcpAuthExtra } from "@/lib/mcp/extra";
import { mcpToolError } from "@/lib/mcp/tool-result";
import { createDeckInputSchema, runCreateDeck } from "@/lib/mcp/tools/create-deck";
import { createCardInputSchema, runCreateCard } from "@/lib/mcp/tools/create-card";
import { createStudySessionInputSchema, runCreateStudySession } from "@/lib/mcp/tools/create-study-session";
import { deleteCardInputSchema, runDeleteCard } from "@/lib/mcp/tools/delete-card";
import { deleteDeckInputSchema, runDeleteDeck } from "@/lib/mcp/tools/delete-deck";
import { getCardInputSchema, runGetCard } from "@/lib/mcp/tools/get-card";
import { getDeckInputSchema, runGetDeck } from "@/lib/mcp/tools/get-deck";
import { runGetDeckCount } from "@/lib/mcp/tools/get-deck-count";
import { listCardsInputSchema, runListCards } from "@/lib/mcp/tools/list-cards";
import { listDecksInputSchema, runListDecks } from "@/lib/mcp/tools/list-decks";
import { listRatingsInputSchema, runListRatings } from "@/lib/mcp/tools/list-ratings";
import {
  listStudySessionCountsInputSchema,
  runListStudySessionCounts,
} from "@/lib/mcp/tools/list-study-session-counts";
import { listStudySessionsInputSchema, runListStudySessions } from "@/lib/mcp/tools/list-study-sessions";
import { patchCardInputSchema, runPatchCard } from "@/lib/mcp/tools/patch-card";
import { patchDeckInputSchema, runPatchDeck } from "@/lib/mcp/tools/patch-deck";
import { replaceCardInputSchema, runReplaceCard } from "@/lib/mcp/tools/replace-card";
import { replaceDeckInputSchema, runReplaceDeck } from "@/lib/mcp/tools/replace-deck";
import {
  createDeckFromDocumentInputSchema,
  runCreateDeckFromDocument,
} from "@/lib/mcp/tools/create-deck-from-document";
import { generateCardsInputSchema, runGenerateCards } from "@/lib/mcp/tools/generate-cards";

type ToolHandlerExtra = { authInfo?: AuthInfo };

/**
 * Resolves authenticated MCP tool context from request extras.
 *
 * @param extra - MCP request handler extras (includes `authInfo` when `withMcpAuth` succeeds)
 * @returns User context or `null` when auth metadata is missing
 */
function requireToolContext(extra: ToolHandlerExtra) {
  return parseMcpAuthExtra(extra.authInfo);
}

/**
 * Registers all Flashycardy MCP tools on the given MCP server instance.
 *
 * @param server - MCP server from `createMcpHandler`
 */
export async function registerFlashycardyMcpTools(server: McpServer): Promise<void> {
  const emptyInputSchema = z.object({});

  server.registerTool(
    "list_decks",
    {
      title: "List decks",
      description: "Lists the current user's decks with pagination (same as GET /api/decks).",
      inputSchema: listDecksInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runListDecks(ctx, args);
    }
  );

  server.registerTool(
    "get_deck_count",
    {
      title: "Get deck count",
      description: "Returns how many decks the user has (GET /api/decks/count).",
      inputSchema: emptyInputSchema,
    },
    async (_args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runGetDeckCount(ctx);
    }
  );

  server.registerTool(
    "create_deck",
    {
      title: "Create deck",
      description: "Creates a deck, optionally with initial cards (POST /api/decks).",
      inputSchema: createDeckInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runCreateDeck(ctx, args);
    }
  );

  server.registerTool(
    "create_deck_from_document",
    {
      title: "Create deck from document",
      description:
        "Creates a deck with 20 AI-generated cards from a base64 document (POST /api/decks/from-document).",
      inputSchema: createDeckFromDocumentInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runCreateDeckFromDocument(ctx, args);
    }
  );

  server.registerTool(
    "generate_cards",
    {
      title: "Generate cards for deck",
      description:
        "AI-generates 20 flashcards for a deck from its description (POST /api/decks/[deckUuid]/generate-cards).",
      inputSchema: generateCardsInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runGenerateCards(ctx, args);
    }
  );

  server.registerTool(
    "get_deck",
    {
      title: "Get deck with cards",
      description: "Returns deck metadata and a paginated card list (GET /api/decks/[deckUuid]).",
      inputSchema: getDeckInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runGetDeck(ctx, args);
    }
  );

  server.registerTool(
    "replace_deck",
    {
      title: "Replace deck",
      description: "Full update of deck name/description (PUT /api/decks/[deckUuid]).",
      inputSchema: replaceDeckInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runReplaceDeck(ctx, args);
    }
  );

  server.registerTool(
    "patch_deck",
    {
      title: "Patch deck",
      description: "Partial update of deck fields (PATCH /api/decks/[deckUuid]).",
      inputSchema: patchDeckInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runPatchDeck(ctx, args);
    }
  );

  server.registerTool(
    "delete_deck",
    {
      title: "Delete deck",
      description: "Deletes a deck owned by the user (DELETE /api/decks/[deckUuid]).",
      inputSchema: deleteDeckInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runDeleteDeck(ctx, args);
    }
  );

  server.registerTool(
    "list_cards",
    {
      title: "List cards",
      description: "Lists cards in a deck with pagination (GET /api/decks/[deckUuid]/cards).",
      inputSchema: listCardsInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runListCards(ctx, args);
    }
  );

  server.registerTool(
    "create_card",
    {
      title: "Create card",
      description: "Creates a single card in a deck (POST /api/decks/[deckUuid]/cards).",
      inputSchema: createCardInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runCreateCard(ctx, args);
    }
  );

  server.registerTool(
    "get_card",
    {
      title: "Get card",
      description: "Returns one card in a deck (GET /api/decks/[deckUuid]/cards/[cardUuid]).",
      inputSchema: getCardInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runGetCard(ctx, args);
    }
  );

  server.registerTool(
    "replace_card",
    {
      title: "Replace card",
      description: "Replaces card front and back (PUT /api/decks/[deckUuid]/cards/[cardUuid]).",
      inputSchema: replaceCardInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runReplaceCard(ctx, args);
    }
  );

  server.registerTool(
    "patch_card",
    {
      title: "Patch card",
      description: "Partially updates a card (PATCH /api/decks/[deckUuid]/cards/[cardUuid]).",
      inputSchema: patchCardInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runPatchCard(ctx, args);
    }
  );

  server.registerTool(
    "delete_card",
    {
      title: "Delete card",
      description: "Deletes a card from a deck (DELETE /api/decks/[deckUuid]/cards/[cardUuid]).",
      inputSchema: deleteCardInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runDeleteCard(ctx, args);
    }
  );

  server.registerTool(
    "list_ratings",
    {
      title: "List deck ratings",
      description: "Aggregated correct/incorrect counts per card (GET /api/decks/[deckUuid]/ratings).",
      inputSchema: listRatingsInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runListRatings(ctx, args);
    }
  );

  server.registerTool(
    "list_study_sessions",
    {
      title: "List study sessions",
      description: "Lists study sessions for the user (GET /api/study-sessions).",
      inputSchema: listStudySessionsInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runListStudySessions(ctx, args);
    }
  );

  server.registerTool(
    "create_study_session",
    {
      title: "Create study session",
      description: "Saves a completed study session (POST /api/study-sessions).",
      inputSchema: createStudySessionInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runCreateStudySession(ctx, args);
    }
  );

  server.registerTool(
    "list_study_session_counts",
    {
      title: "List study session counts by deck",
      description: "Session counts grouped by deck (GET /api/study-sessions/counts).",
      inputSchema: listStudySessionCountsInputSchema,
    },
    async (args, extra) => {
      const ctx = requireToolContext(extra);
      if (!ctx) return mcpToolError("Unauthorized");
      return runListStudySessionCounts(ctx, args);
    }
  );
}
