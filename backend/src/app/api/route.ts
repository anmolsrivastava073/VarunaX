import { NextResponse } from "next/server";

/**
 * GET /
 * Root route — returns SIH 2026 API info.
 */
export async function GET() {
  return NextResponse.json({
    name: "SIH 2026 Oil Spill Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      incidents: "GET /api/v1/incidents",
      incidentDetail: "GET /api/v1/incidents/:id",
      incidentResults: "GET /api/v1/incidents/:id/results",
      incidentGeojson: "GET /api/v1/incidents/:id/geojson",
      incidentPdf: "GET /api/v1/incidents/:id/pdf",
      stream: "GET /api/v1/pipeline/stream?incidentId=:id",
      internal: {
        create: "POST /api/v1/incidents",
        system1: "POST /api/v1/incidents/:id/system1",
        system2: "POST /api/v1/incidents/:id/system2",
        system3: "POST /api/v1/incidents/:id/system3",
      },
    },
    docs: "See SIH_2026_Backend_Documentation.md for full API contracts",
  });
}
