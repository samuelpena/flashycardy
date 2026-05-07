import { NextResponse } from "next/server";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Attaches CORS headers to an existing NextResponse.
 */
export function withCors(res: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) =>
    res.headers.set(key, value)
  );
  return res;
}

/**
 * Returns a 204 preflight response with CORS headers.
 * Export this as `OPTIONS` from every public route file.
 *
 * @example
 * export { preflight as OPTIONS } from "@/lib/api/cors";
 */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
