import { afterEach, describe, expect, test, vi } from "vitest";
import { ApiError } from "./errors";
import { createFlashycardyApi } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createFlashycardyApi", () => {
  test("lists decks with pagination envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ uuid: "d1", name: "Deck" }],
        meta: {
          total_items: 1,
          per_page: 20,
          total_pages: 1,
          current_page: 1,
        },
        links: {
          next: null,
          prev: null,
          first: "http://localhost:3000/api/decks?page=1",
          last: "http://localhost:3000/api/decks?page=1",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = createFlashycardyApi({
      baseUrl: "http://localhost:3000",
      getToken: async () => "sess-jwt",
    });

    const result = await api.decks.list({ page: 1, pageSize: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.meta.total_items).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/decks?page=1&pageSize=20",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer sess-jwt");
  });

  test("generateCards mutation throws ApiError on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "AI flashcard generation requires a Pro plan" }),
      }),
    );

    const api = createFlashycardyApi({
      baseUrl: "http://localhost:3000",
      getToken: async () => "token",
    });

    await expect(api.decks.generateCards("550e8400-e29b-41d4-a716-446655440000")).rejects.toThrow(
      ApiError,
    );
  });
});
