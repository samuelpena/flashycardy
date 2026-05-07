import { jsonError } from "@/lib/api/responses";

export type Pagination = {
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
};

export type PaginationMetadata = {
  total_items: number;
  per_page: number;
  total_pages: number;
  current_page: number;
};

export type PaginationLinks = {
  next: string | null;
  prev: string | null;
  first: string;
  last: string;
};

export type PaginationEnvelope = {
  meta: PaginationMetadata;
  links: PaginationLinks;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function parsePagination(searchParams: URLSearchParams):
  | { success: true; pagination: Pagination }
  | { success: false; response: ReturnType<typeof jsonError> } {
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = pageParam === null ? DEFAULT_PAGE : Number(pageParam);
  const pageSize = pageSizeParam === null ? DEFAULT_PAGE_SIZE : Number(pageSizeParam);

  if (!Number.isInteger(page) || page < 1) {
    return { success: false, response: jsonError("Invalid page", 400) };
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return { success: false, response: jsonError("Invalid pageSize", 400) };
  }

  return {
    success: true,
    pagination: {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      page,
      pageSize,
    },
  };
}

export function paginationEnvelope(
  currentUrl: Pick<URL, "href">,
  totalItems: number,
  pagination: Pagination
): PaginationEnvelope {
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const lastPage = Math.max(totalPages, 1);
  const currentPage = pagination.page;

  return {
    meta: {
      total_items: totalItems,
      per_page: pagination.pageSize,
      total_pages: totalPages,
      current_page: currentPage,
    },
    links: {
      next: currentPage < totalPages ? pageUrl(currentUrl.href, currentPage + 1, pagination.pageSize) : null,
      prev: currentPage > 1 ? pageUrl(currentUrl.href, currentPage - 1, pagination.pageSize) : null,
      first: pageUrl(currentUrl.href, 1, pagination.pageSize),
      last: pageUrl(currentUrl.href, lastPage, pagination.pageSize),
    },
  };
}

function pageUrl(href: string, page: number, pageSize: number): string {
  const url = new URL(href);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  return url.toString();
}
