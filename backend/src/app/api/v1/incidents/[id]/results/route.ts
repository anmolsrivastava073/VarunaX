import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({
      dossier_id: incident.id,
      final_status: incident.status,
      timestamp: new Date().toISOString(),
      observation: incident.observation,
      detection: incident.system1,
      drift_model: incident.system2,
      attribution: incident.system3,
    });
  } catch (error) {
    console.error("Error fetching incident results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
