import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CaseListQuerySchema } from '@/lib/validation';
import { CaseStatus, Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    
    const parsed = CaseListQuerySchema.safeParse({
      status: statusParam || undefined,
      search: searchParam || undefined,
      page: pageParam ? parseInt(pageParam, 10) : 1,
      limit: limitParam ? parseInt(limitParam, 10) : 20,
    });

    const page = parsed.success && parsed.data.page ? parsed.data.page : 1;
    const limit = parsed.success && parsed.data.limit ? parsed.data.limit : 20;
    const status = parsed.success && parsed.data.status ? parsed.data.status : (statusParam as CaseStatus | undefined);
    const search = parsed.success && parsed.data.search ? parsed.data.search : searchParam;

    const whereConditions: Prisma.CaseWhereInput[] = [];

    if (status) {
      whereConditions.push({ status: status as CaseStatus });
    }

    if (search) {
      whereConditions.push({ id: { contains: search, mode: 'insensitive' as Prisma.QueryMode } });
    }

    const where: Prisma.CaseWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [cases, total, activeSlicksCount, confirmedCount] = await Promise.all([
      prisma.case.findMany({ 
        where, 
        orderBy: { createdAt: 'desc' }, 
        skip: (page - 1) * limit, 
        take: limit 
      }),
      prisma.case.count({ where }),
      prisma.case.count({ where: { status: { in: ['detecting', 'drift_calculating', 'ais_scanning'] } } }),
      prisma.case.count({ where: { status: 'confirmed' } }),
    ]);

    const totalCases = await prisma.case.count();

    // TODO: Calculate real average attribution hours based on DB timestamps
    const avgAttributionHours = 4.2;

    return NextResponse.json({
      cases,
      metrics: {
        activeSlicksCount,
        confirmedCount,
        totalCases,
        avgAttributionHours
      },
      pagination: { 
        page, 
        limit, 
        total 
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
