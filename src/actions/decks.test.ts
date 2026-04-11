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
  updateDeck: vi.fn(),
  deleteDeckByIdAndUser: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDeckCountByUser, insertDeck, updateDeck, deleteDeckByIdAndUser } from "@/db/queries/decks";
import { createDeckAction, updateDeckAction, deleteDeckAction } from "./decks";

const mockAuth = vi.mocked(auth);
const mockGetDeckCountByUser = vi.mocked(getDeckCountByUser);
const mockInsertDeck = vi.mocked(insertDeck);
const mockUpdateDeck = vi.mocked(updateDeck);
const mockDeleteDeckByIdAndUser = vi.mocked(deleteDeckByIdAndUser);
const mockRevalidatePath = vi.mocked(revalidatePath);

const USER_ID = "user_123";
const DECK_ID = 1;

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
// updateDeckAction
// ---------------------------------------------------------------------------

describe("updateDeckAction", () => {
  test("returns Unauthorized when no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const result = await updateDeckAction({ deckId: DECK_ID, name: "Updated" });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockUpdateDeck).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await updateDeckAction({ deckId: DECK_ID, name: "" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockUpdateDeck).not.toHaveBeenCalled();
  });

  test("returns validation error when deckId is not a positive integer", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await updateDeckAction({ deckId: -1, name: "Updated" });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockUpdateDeck).not.toHaveBeenCalled();
  });

  test("returns Deck not found when update affects no rows", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateDeck.mockResolvedValue([]);

    const result = await updateDeckAction({ deckId: DECK_ID, name: "Updated" });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  test("updates deck and revalidates on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateDeck.mockResolvedValue([{ id: DECK_ID }] as never);

    const result = await updateDeckAction({ deckId: DECK_ID, name: "Updated", description: "New desc" });

    expect(result).toEqual({ success: true });
    expect(mockUpdateDeck).toHaveBeenCalledWith(DECK_ID, USER_ID, {
      name: "Updated",
      description: "New desc",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_ID}`);
  });

  test("passes null description when description is omitted", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockUpdateDeck.mockResolvedValue([{ id: DECK_ID }] as never);

    await updateDeckAction({ deckId: DECK_ID, name: "Updated" });

    expect(mockUpdateDeck).toHaveBeenCalledWith(DECK_ID, USER_ID, {
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

    const result = await deleteDeckAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "Unauthorized" });
    expect(mockDeleteDeckByIdAndUser).not.toHaveBeenCalled();
  });

  test("returns validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);

    const result = await deleteDeckAction({ deckId: -5 });

    expect(result).toMatchObject({ error: expect.objectContaining({ fieldErrors: expect.any(Object) }) });
    expect(mockDeleteDeckByIdAndUser).not.toHaveBeenCalled();
  });

  test("returns Deck not found when delete affects no rows", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteDeckByIdAndUser.mockResolvedValue([]);

    const result = await deleteDeckAction({ deckId: DECK_ID });

    expect(result).toEqual({ error: "Deck not found" });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  test("deletes deck and revalidates both paths on success", async () => {
    mockAuth.mockResolvedValue({ userId: USER_ID } as never);
    mockDeleteDeckByIdAndUser.mockResolvedValue([{ id: DECK_ID }] as never);

    const result = await deleteDeckAction({ deckId: DECK_ID });

    expect(result).toEqual({ success: true });
    expect(mockDeleteDeckByIdAndUser).toHaveBeenCalledWith(DECK_ID, USER_ID);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/decks/${DECK_ID}`);
  });
});
