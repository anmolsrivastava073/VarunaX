import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the X-API-Key header against the INTERNAL_API_KEY env var.
 * Returns null if authentication passes, or a 401 NextResponse if it fails.
 *
 * Usage:
 *   const authError = validateApiKey(request);
 *   if (authError) return authError;
 */
export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get("X-API-Key");
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey) {
    console.error("INTERNAL_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Server misconfiguration: API key not set" },
      { status: 500 }
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or missing X-API-Key header" },
      { status: 401 }
    );
  }

  return null; // Auth passed
}
