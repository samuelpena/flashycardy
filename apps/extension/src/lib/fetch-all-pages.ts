import type { PaginatedResponse, PaginationParams } from "@flashycardy/api-client";

/**
 * Fetches every page from a paginated API helper.
 */
export async function fetchAllPages<T>(
  fetchPage: (pagination: PaginationParams) => Promise<PaginatedResponse<T>>,
  pageSize = 100,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const response = await fetchPage({ page, pageSize });
    items.push(...response.data);
    if (page >= response.meta.total_pages) break;
    page += 1;
  }

  return items;
}
