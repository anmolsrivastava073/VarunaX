import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { System2OutputSchema } from "@/lib/validation";
import { validateApiKey } from "@/lib/auth";
import { emitIncidentUpdate } from "@/lib/events";
import { IncidentStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = validateApiKey(request);
    if (authError) return authError;

    const { id } = params;
    const body = await request.json();
    const validated = System2OutputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", details: validated.error.errors }, { status: 400 });
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        system2: body,
        status: IncidentStatus.system3_pending,
      },
    });

    emitIncidentUpdate({
      incidentId: id,
      system: "system2",
      status: incident.status,
      payload: body,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error("Error updating system2:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
