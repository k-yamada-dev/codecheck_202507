// GET /api/logs?filter=all|embed|decode&search=&startDate=&endDate=&cursor=&limit=
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, JobType, JobStatus } from '@prisma/client';
import { getSessionInfo } from '@/app/utils/apiAuth';
import { JobCreateRequestDTOImpl } from '@/app/dto/JobCreateRequestDTO';
import { JobCreateDataDTOImpl } from '@/app/dto/JobCreateDataDTO';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let jobData;
    try {
      const dto = new JobCreateRequestDTOImpl(body);
      jobData = dto;
    } catch (error: any) {
      console.error('DTO validation failed:', error?.message || 'Unknown error');
      return NextResponse.json(
        problemJson('about:blank', error?.message || 'Validation failed', 400),
        { status: 400 }
      );
    }
    console.log('POST /api/v1/logs called with validated DTO:', jobData);

    const { tenantId, userId, userName } = await getSessionInfo();
    const jobDataDTO = new JobCreateDataDTOImpl(
      jobData.type,
      jobData.srcImagePath,
      jobData.params,
      tenantId,
      userId,
      userName
    );

    const created = await prisma.job.create({
      data: jobDataDTO,
    });

    return NextResponse.json({
      ...created,
      userName,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/v1/logs:', err);
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}

function problemJson(type: string, title: string, status: number, detail?: string) {
  return {
    type,
    title,
    status,
    detail,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') ?? 'all';
  const search = searchParams.get('search') ?? '';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? 50);

  const where: any = {};

  if (filter !== 'all') {
    where.type = filter === 'embed' ? JobType.EMBED : JobType.DECODE;
  }
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { userId: { contains: search } },
      { params: { path: ['watermark_text'], string_contains: search } },
      { result: { path: ['detected_text'], string_contains: search } },
    ];
  }
  if (startDate) {
    where.startedAt = { ...(where.startedAt || {}), gte: new Date(startDate) };
  }
  if (endDate) {
    where.startedAt = { ...(where.startedAt || {}), lte: new Date(endDate) };
  }

  const queryArgs: any = {
    where,
    orderBy: { startedAt: 'desc' },
    take: limit + 1,
  };
  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1;
  }

  try {
    const jobs = await prisma.job.findMany(queryArgs);

    const hasNextPage = jobs.length > limit;
    const jobsPage = hasNextPage ? jobs.slice(0, limit) : jobs;

    // userNameを含めて返却
    return NextResponse.json({
      jobs: jobsPage.map(job => ({
        ...job,
        userName: job.userName,
      })),
      nextCursor: hasNextPage ? jobsPage[jobsPage.length - 1].id : null,
      hasNextPage,
    });
  } catch (err: any) {
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}
