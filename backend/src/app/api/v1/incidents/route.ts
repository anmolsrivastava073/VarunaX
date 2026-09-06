import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateIncidentSchema } from "@/lib/validation";
import { validateApiKey } from "@/lib/auth";
import { emitIncidentUpdate } from "@/lib/events";
import { generateIncidentId } from "@/lib/incident-id";
import { IncidentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.id = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.incident.count({ where }),
    ]);

    const metrics = {
      total,
      pendingSystem1: await prisma.incident.count({ where: { status: "system1_pending" } }),
      completed: await prisma.incident.count({ where: { status: "completed" } }),
    };

    return NextResponse.json({
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      metrics,
    });
  } catch (error) {
    console.error("Error listing incidents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = validateApiKey(request);
    if (authError) return authError;

    const body = await request.json();
    const validated = CreateIncidentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request data", details: validated.error.errors }, { status: 400 });
    }

    const id = await generateIncidentId();

    const incident = await prisma.incident.create({
      data: {
        id,
        status: IncidentStatus.system1_pending,
        observation: body,
      },
    });

    emitIncidentUpdate({
      incidentId: id,
      system: "system1",
      status: incident.status,
      payload: {},
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
