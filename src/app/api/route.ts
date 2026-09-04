import { NextResponse } from "next/server";

/**
 * GET /
 * Root route — redirects to health check or returns API info.
 * API-only backend: no frontend pages.
 */
export async function GET() {
  return NextResponse.json({
    name: "Oil Spill Detection & Attribution API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      cases: "/api/cases",
      caseDetail: "/api/cases/:id",
      stream: "/api/pipeline/stream?caseId=:id",
      report: "/api/report/:id?format=geojson|pdf",
      internal: {
        start: "POST /api/internal/cases/start",
        stage: "POST /api/internal/cases/:id/stage",
      },
    },
    docs: "See README.md for full API documentation",
  });
}
