import { NextResponse } from "next/server";
import { withCors } from "@/lib/api/cors";
import type { PaginationEnvelope } from "@/lib/api/pagination";

export function jsonData<T>(data: T, status = 200): NextResponse {
  return withCors(NextResponse.json({ data }, { status }));
}

export function jsonPaginatedData<T>(
  data: T[],
  pagination: PaginationEnvelope,
  status = 200
): NextResponse {
  return withCors(NextResponse.json({ data, ...pagination }, { status }));
}

export function jsonDataWithPagination<T>(
  data: T,
  pagination: PaginationEnvelope,
  status = 200
): NextResponse {
  return withCors(NextResponse.json({ data, ...pagination }, { status }));
}

export function jsonError(error: string, status: number): NextResponse {
  return withCors(NextResponse.json({ error }, { status }));
}
