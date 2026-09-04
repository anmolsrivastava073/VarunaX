import { NextRequest } from 'next/server';
import { subscribeCaseUpdates, subscribeAllCaseUpdates, CaseEvent } from '@/lib/events';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get('caseId');

  let heartbeatInterval: NodeJS.Timeout;
  let unsubscribe: () => void;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const push = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch (e) {
          // ignore closed stream errors
        }
      };

      push(': connected\n\n');

      if (caseId) {
        const existingCase = await prisma.case.findUnique({
          where: { id: caseId }
        });
        if (existingCase) {
          push(`data: ${JSON.stringify({ type: 'init', case: existingCase })}\n\n`);
        }
      }

      heartbeatInterval = setInterval(() => {
        push(': heartbeat\n\n');
      }, 30000);

      const callback = (event: CaseEvent) => {
        push(`data: ${JSON.stringify({ type: 'stage_update', ...event })}\n\n`);
      };

      if (caseId) {
        unsubscribe = subscribeCaseUpdates(caseId, callback);
      } else {
        unsubscribe = subscribeAllCaseUpdates(callback);
      }
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (unsubscribe) unsubscribe();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  });
}
