import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCaseId } from '@/lib/case-id';
import { emitCaseUpdate } from '@/lib/events';

export async function POST(request: NextRequest) {
  try {
    const authError = validateApiKey(request);
    if (authError) return authError;

    const caseId = await generateCaseId();

    const newCase = await prisma.case.create({
      data: {
        id: caseId,
        status: 'detecting',
      },
    });

    emitCaseUpdate({
      caseId,
      stage: 'started',
      status: 'detecting',
      payload: {},
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        caseId: newCase.id,
        status: newCase.status,
        createdAt: newCase.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error starting case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
