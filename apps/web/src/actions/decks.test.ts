import { expect, test, vi, beforeEach, describe } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db/queries/decks", () => ({
  getDeckCountByUser: vi.fn(),
  insertDeck: vi.fn(),
  insertDeckWithCards: vi.fn(),
  updateDeckByUuid: vi.fn(),
  deleteDeckByUuidAndUser: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: {
    object: vi.fn((opts: unknown) => opts),
  },
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn((model: string) => model),
}));

vi.mock("@/lib/extract-document-text", () => ({
  extractPlainTextFromDocumentBuffer: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import {
  getDeckCountByUser,
  insertDeck,
  insertDeckWithCards,
  updateDeckByUuid,
  deleteDeckByUuidAndUser,
} from "@/db/queries/decks";
import { extractPlainTextFromDocumentBuffer } from "@/lib/extract-document-text";
import {
  createDeckAction,
  createDeckFromDocumentAction,
  updateDeckAction,
  deleteDeckAction,
} from "./decks";

const mockAuth = vi.mocked(auth);
const mockGetDeckCountByUser = vi.mocked(getDeckCountByUser);
const mockInsertDeck = vi.mocked(insertDeck);
const mockInsertDeckWithCards = vi.mocked(insertDeckWithCards);
const mockUpdateDeckByUuid = vi.mocked(updateDeckByUuid);
const mockDeleteDeckByUuidAndUser = vi.mocked(deleteDeckByUuidAndUser);
const mockGenerateText = vi.mocked(generateText);
const mockExtractPlainText = vi.mocked(extractPlainTextFromDocumentBuffer);
const mockRevalidatePath = vi.mocked(revalidatePath);

const USER_ID = "user_123";
const DECK_UUID = "01960000-0000-7000-8000-000000000001";

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createDeckAction
// ---------------------------------------------------------------------------

describe("createDeckAction", () => {
  const mockHas = vi.fn();

  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null, has: mockHas } as never);

    const result = await createDeckAction({ name: "Deck 1" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockInsertDeck).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);

    const result = await createDeckAction({ name: "" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockInsertDeck).not.toHaveBeenCalled();
  });

  test("returns deck limit error when free user has reached 3 decks", async () => {
    mockHas.mockReturnValue(false);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckCountByUser.mockResolvedValue(3);

    const result = await createDeckAction({ name: "New Deck" });

    expect(result).toEqual({
      error: "You've reached the 3-deck limit on the free plan. Upgrade to Pro for unlimited decks.",
    });
    expect(mockInsertDeck).not.toHaveBeenCalled();
  });

  test("inserts deck when free user is under the limit", async () => {
    mockHas.mockReturnValue(false);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckCountByUser.mockResolvedValue(2);
    mockInsertDeck.mockResolvedValue([] as never);

    const result = await createDeckAction({ name: "New Deck" });

    expect(result).toEqual({ success: true });
    expect(mockInsertDeck).toHaveBeenCalledWith({
      clerkUserId: USER_ID,
      name: "New Deck",
      description: null,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  test("skips deck count check and inserts when user has unlimited_decks feature", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockInsertDeck.mockResolvedValue([] as never);

    const result = await createDeckAction({ name: "Pro Deck", description: "A pro deck" });

    expect(result).toEqual({ success: true });
    expect(mockGetDeckCountByUser).not.toHaveBeenCalled();
    expect(mockInsertDeck).toHaveBeenCalledWith({
      clerkUserId: USER_ID,
      name: "Pro Deck",
      description: "A pro deck",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

// ---------------------------------------------------------------------------
// createDeckFromDocumentAction
// ---------------------------------------------------------------------------

describe("createDeckFromDocumentAction", () => {
  const mockHas = vi.fn();

  const validInput = {
    fileBase64: Buffer.from("%PDF-1.4 fake").toString("base64"),
    fileName: "notes.pdf",
  };

  const aiCards = Array.from({ length: 20 }, (_, i) => ({
    front: `Q${i + 1}`,
    back: `A${i + 1}`,
  }));

  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null, has: mockHas } as never);

    const result = await createDeckFromDocumentAction(validInput);

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockExtractPlainText).not.toHaveBeenCalled();
  });

  test("returns error when document_deck_generation feature is missing", async () => {
    mockHas.mockReturnValue(false);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);

    const result = await createDeckFromDocumentAction(validInput);

    expect(result).toEqual({
      error: "Document-based deck generation requires a Pro plan with this feature enabled.",
    });
    expect(mockExtractPlainText).not.toHaveBeenCalled();
  });

  test("returns error for unsupported file extension", async () => {
    mockHas.mockReturnValue(true);
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);

    const result = await createDeckFromDocumentAction({
      ...validInput,
      fileName: "notes.exe",
    });

    expect(result).toEqual({
      error: "Unsupported file type. Upload a .pdf, .docx, or .pptx file.",
    });
    expect(mockExtractPlainText).not.toHaveBeenCalled();
  });

  test("returns deck limit error when user lacks unlimited_decks and is at limit", async () => {
    mockHas.mockImplementation((q: { feature?: string }) => {
      if (q.feature === "document_deck_generation") return true;
      if (q.feature === "unlimited_decks") return false;
      return false;
    });
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockGetDeckCountByUser.mockResolvedValue(3);

    const result = await createDeckFromDocumentAction(validInput);

    expect(result).toEqual({
      error: "You've reached the 3-deck limit on the free plan. Upgrade to Pro for unlimited decks.",
    });
    expect(mockExtractPlainText).not.toHaveBeenCalled();
  });

  test("creates deck with cards and returns deckUuid on success", async () => {
    mockHas.mockImplementation((q: { feature?: string }) => {
      if (q.feature === "document_deck_generation") return true;
      if (q.feature === "unlimited_decks") return true;
      return false;
    });
    mockAuth.mockResolvedValue({ userId: USER_ID, has: mockHas } as never);
    mockExtractPlainText.mockResolvedValue("Chapter one about photosynthesis.");
    mockGenerateText.mockResolvedValue({
      output: {
        title: "Bio deck",
        description: "From uploaded doc",
        cards: aiCards,
      },
    } as never);
    mockInsertDeckWithCards.mockResolvedValue({ uuid: DECK_UUID, name: "Bio deck" } as never);

    const result = await createDeckFromDocumentAction(validInput);

    expect(result).toEqual({ success: true, deckUuid: DECK_UUID });
    expect(mockExtractPlainText).toHaveBeenCalled();
    expect(mockInsertDeckWithCards).toHaveBeenCalledWith(
      {
        clerkUserId: USER_ID,
        name: "Bio deck",
        description: "From uploaded doc",
      },
      aiCards,
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });
});

// ---------------------------------------------------------------------------
// updateDeckAction
// ---------------------------------------------------------------------------

describe("updateDeckAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await updateDeckAction({ deckUuid: DECK_UUID, name: "Updated" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockUpdateDeckByUuid).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await updateDeckAction({ deckUuid: DECK_UUID, name: "" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockUpdateDeckByUuid).not.toHaveBeenCalled();
  });

  test("returns validation error when deckUuid is not a valid uuid", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await updateDeckAction({ deckUuid: "not-a-uuid", name: "Updated" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockUpdateDeckByUuid).not.toHaveBeenCalled();
  });

  test("returns Deck not found when update affects no rows", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateDeckByUuid.mockResolvedValue([]);

    const result = await updateDeckAction({ deckUuid: DECK_UUID, name: "Updated" });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  test("updates deck and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateDeckByUuid.mockResolvedValue([{ uuid: DECK_UUID }] as never);

    const result = await updateDeckAction({ deckUuid: DECK_UUID, name: "Updated", description: "New desc" });

    expect(result).toEqual({ success: true });
    expect(mockUpdateDeckByUuid).toHaveBeenCalledWith(DECK_UUID, USER_ID, {
      name: "Updated",
      description: "New desc",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });

  test("passes null description when description is omitted", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateDeckByUuid.mockResolvedValue([{ uuid: DECK_UUID }] as never);

    await updateDeckAction({ deckUuid: DECK_UUID, name: "Updated" });

    expect(mockUpdateDeckByUuid).toHaveBeenCalledWith(DECK_UUID, USER_ID, {
      name: "Updated",
      description: null,
    });
  });
});

// ---------------------------------------------------------------------------
// deleteDeckAction
// ---------------------------------------------------------------------------

describe("deleteDeckAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await deleteDeckAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockDeleteDeckByUuidAndUser).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await deleteDeckAction({ deckUuid: "not-a-uuid" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockDeleteDeckByUuidAndUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found when delete affects no rows", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteDeckByUuidAndUser.mockResolvedValue([]);

    const result = await deleteDeckAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  test("deletes deck and revalidates both paths on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteDeckByUuidAndUser.mockResolvedValue([{ uuid: DECK_UUID }] as never);

    const result = await deleteDeckAction({ deckUuid: DECK_UUID });

    expect(result).toEqual({ success: true });
    expect(mockDeleteDeckByUuidAndUser).toHaveBeenCalledWith(DECK_UUID, USER_ID);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_UUID}`);
  });
});
