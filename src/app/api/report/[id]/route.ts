import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildCaseGeoJSON } from '@/lib/geojson-builder';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { CaseReportPDF } from '@/lib/pdf-report';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'geojson';

    const caseRecord = await prisma.case.findUnique({ where: { id } });

    if (!caseRecord) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    if (format === 'pdf') {
      const pdfBuffer = await renderToBuffer(
        React.createElement(CaseReportPDF, { caseRecord }) as any
      );

      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${id}-dossier.pdf"`,
        },
      });
    }

    // Default: GeoJSON export
    const geojson = buildCaseGeoJSON(caseRecord);

    return new Response(JSON.stringify(geojson, null, 2), {
      headers: {
        'Content-Type': 'application/geo+json',
        'Content-Disposition': `attachment; filename="${id}-export.geojson"`,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
