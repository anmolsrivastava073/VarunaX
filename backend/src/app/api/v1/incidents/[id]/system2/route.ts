import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";
import { emitIncidentUpdate } from "@/lib/events";
import { IncidentStatus } from "@prisma/client";
import { MOCK_INCIDENTS } from "../../../../../../../scripts/mock-data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = validateApiKey(request);
    if (authError) return authError;

    const { id } = params;
    const hardcodedPayload = MOCK_INCIDENTS[0].system2;

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        system2: hardcodedPayload as any,
        status: IncidentStatus.system3_pending,
      },
    });

    emitIncidentUpdate({
      incidentId: id,
      system: "system2",
      status: incident.status,
      payload: hardcodedPayload as any,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error("Error updating system2:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
