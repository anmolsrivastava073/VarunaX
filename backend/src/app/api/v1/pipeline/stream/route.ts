export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeIncidentUpdates, subscribeAllIncidentUpdates } from "@/lib/events";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const incidentId = searchParams.get("incidentId");

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  writer.write(encoder.encode('retry: 10000\n\n'));

  let unsubscribe: (() => void) | undefined;

  const onUpdate = async (data: any) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      console.error("Stream write error:", e);
    }
  };

  if (incidentId) {
    const existingIncident = await prisma.incident.findUnique({
      where: { id: incidentId }
    });

    if (existingIncident) {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'initial', incident: existingIncident })}\n\n`));
    }
    
    if (typeof subscribeIncidentUpdates === "function") {
      unsubscribe = subscribeIncidentUpdates(incidentId, onUpdate);
    }
  } else {
    if (typeof subscribeAllIncidentUpdates === "function") {
      unsubscribe = subscribeAllIncidentUpdates(onUpdate);
    }
  }

  request.signal.addEventListener("abort", () => {
    if (unsubscribe) unsubscribe();
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
