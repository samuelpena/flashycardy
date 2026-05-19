import { z } from "zod";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const pageFieldsSchema = z.object({
  page: z.number().int().min(1).max(1_000_000).optional(),
  pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
});

export type PageFields = z.infer<typeof pageFieldsSchema>;

export type PaginationSlice = {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
};

/**
 * Coerces optional page / pageSize into Drizzle limit/offset (same rules as REST `parsePagination`).
 *
 * @param input - Raw tool arguments containing optional pagination fields
 * @returns Parsed pagination or a Zod error message
 */
export function parsePageArgs(input: unknown):
  | { ok: true; value: PaginationSlice }
  | { ok: false; error: string } {
  const parsed = pageFieldsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }
  const page = parsed.data.page ?? DEFAULT_PAGE;
  const pageSize = parsed.data.pageSize ?? DEFAULT_PAGE_SIZE;
  return {
    ok: true,
    value: {
      page,
      pageSize,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  };
}

export function paginationMeta(totalItems: number, slice: PaginationSlice) {
  const totalPages = Math.ceil(totalItems / slice.pageSize) || 1;
  return {
    total_items: totalItems,
    per_page: slice.pageSize,
    total_pages: totalPages,
    current_page: slice.page,
  };
}
