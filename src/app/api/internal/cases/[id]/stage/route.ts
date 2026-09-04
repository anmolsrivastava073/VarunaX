import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StageUpdateSchema } from '@/lib/validation';
import { emitCaseUpdate } from '@/lib/events';
import { CaseStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = validateApiKey(request);
    if (authError) return authError;

    const { id } = await params;

    const body = await request.json();
    const parsed = StageUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Bad Request', details: parsed.error.format() }, { status: 400 });
    }

    const existingCase = await prisma.case.findUnique({
      where: { id },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { stage, data } = parsed.data;
    const sourceRefs = 'sourceRefs' in parsed.data ? parsed.data.sourceRefs : undefined;

    let mergedSourceRefs = (existingCase.sourceRefs as Record<string, unknown>) || {};
    if (sourceRefs) {
      mergedSourceRefs = { ...mergedSourceRefs, ...sourceRefs };
    }

    let updateData: any = {};

    switch (stage) {
      case 'detected':
        updateData = {
          system1: data,
          status: CaseStatus.drift_calculating,
          sourceRefs: mergedSourceRefs,
        };
        break;
      case 'drift_calculated':
        updateData = {
          system2: data,
          status: CaseStatus.ais_scanning,
          sourceRefs: mergedSourceRefs,
        };
        break;
      case 'attributed':
        updateData = {
          system3: data,
          status: CaseStatus.confirmed,
          sourceRefs: mergedSourceRefs,
        };
        break;
      case 'complete':
        updateData = {
          status: data?.resolved === false ? CaseStatus.unresolved : CaseStatus.confirmed,
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const updatedCase = await prisma.case.update({
      where: { id },
      data: updateData,
    });

    emitCaseUpdate({
      caseId: id,
      stage: parsed.data.stage,
      status: updatedCase.status,
      payload: parsed.data.stage === 'complete' ? {} : (parsed.data.data as Record<string, unknown>),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error('Error updating case stage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
