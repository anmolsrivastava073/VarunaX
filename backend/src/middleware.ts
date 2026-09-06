import { NextRequest, NextResponse } from "next/server";

/**
 * CORS middleware for API routes.
 * Handles preflight OPTIONS requests and sets CORS headers on all API responses.
 */
export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // Check if origin is allowed (allow all in development)
  const isAllowed =
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(origin) ||
    allowedOrigins.includes("*");

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-API-Key",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // For all other requests, add CORS headers to the response
  const response = NextResponse.next();

  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

// Only apply middleware to API routes
export const config = {
  matcher: "/api/:path*",
};
