import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateIncidentPDF } from "@/lib/pdf-report";

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

    const pdfBuffer = await generateIncidentPDF(incident);

    // Use the standard web Response object for binary streams to satisfy TypeScript
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${id}_dossier.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
