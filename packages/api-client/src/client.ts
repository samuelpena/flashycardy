import { ApiError } from "./errors";
import type { PaginatedResponse, PaginationMeta, PaginationLinks, PaginationParams } from "./types";

export type FlashycardyClientOptions = {
  baseUrl: string;
  getToken: () => Promise<string | null>;
};

type ErrorEnvelope = { error: string };

function buildQuery(params?: PaginationParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
  const q = search.toString();
  return q ? `?${q}` : "";
}

/**
 * Creates a typed HTTP client for the FlashyCardy REST API.
 *
 * @param options - API origin and async token provider (Clerk session JWT)
 */
export function createFlashycardyClient(options: FlashycardyClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    const token = await options.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const json = (await res.json().catch(() => ({}))) as T & ErrorEnvelope;

    if (!res.ok) {
      throw new ApiError(
        res.status,
        typeof json.error === "string" ? json.error : "Request failed",
      );
    }
    if (typeof json.error === "string") {
      throw new ApiError(res.status, json.error);
    }

    return json;
  }

  async function requestData<T>(path: string, init?: RequestInit): Promise<T> {
    const json = await requestJson<{ data: T }>(path, init);
    if (!("data" in json)) throw new ApiError(500, "Invalid response envelope");
    return json.data;
  }

  async function requestPaginated<T>(
    path: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<T>> {
    const json = await requestJson<PaginatedResponse<T>>(`${path}${buildQuery(pagination)}`);
    if (!json.meta || !json.links) {
      throw new ApiError(500, "Missing pagination metadata");
    }
    return json;
  }

  async function requestDataWithPagination<T>(
    path: string,
    pagination?: PaginationParams,
  ): Promise<{ data: T; meta: PaginationMeta; links: PaginationLinks }> {
    const json = await requestJson<{
      data: T;
      meta: PaginationMeta;
      links: PaginationLinks;
    }>(`${path}${buildQuery(pagination)}`);
    if (!json.meta || !json.links) {
      throw new ApiError(500, "Missing pagination metadata");
    }
    return json;
  }

  return {
    requestJson,
    requestData,
    requestPaginated,
    requestDataWithPagination,
    buildQuery,
  };
}

export type FlashycardyClient = ReturnType<typeof createFlashycardyClient>;
