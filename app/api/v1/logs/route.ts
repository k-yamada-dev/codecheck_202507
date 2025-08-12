// GET /api/logs?filter=all|embed|decode&search=&startDate=&endDate=&cursor=&limit=
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, JobType, Prisma, JobStatus } from '@prisma/client';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { jobCreateRequestSchema } from '@/lib/dto/JobCreateRequestDTO';
import { withErrorHandling } from '@/lib/errors/apiHandler';

const prisma = new PrismaClient();

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const jobData = jobCreateRequestSchema.parse(body);

  const { tenantId, userId, userName } = await getSessionInfo();

  const created = await prisma.job.create({
    data: {
      ...jobData,
      tenantId,
      userId,
      userName,
      imageUrl: jobData.srcImagePath,
      status: JobStatus.PENDING, // Default status
      result: {}, // Default empty result
      ip: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
      ua: req.headers.get('user-agent'),
    },
  });

  return NextResponse.json(
    {
      ...created,
      userName,
    },
    { status: 201 }
  );
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') ?? 'all';
  const search = searchParams.get('search') ?? '';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? 50);

  const where: Prisma.JobWhereInput = {};

  if (filter !== 'all') {
    where.type = filter === 'embed' ? JobType.EMBED : JobType.DECODE;
  }
  if (search) {
    where.OR = [
      // { id: { contains: search } }, // UUID does not support 'contains'
      // { userId: { contains: search } }, // UUID does not support 'contains'
      { params: { path: ['watermark_text'], string_contains: search } },
      { result: { path: ['detected_text'], string_contains: search } },
    ];
  }
  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) {
      where.startedAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.startedAt.lte = new Date(endDate);
    }
  }

  const queryArgs: Prisma.JobFindManyArgs = {
    where,
    orderBy: { startedAt: 'desc' },
    take: limit + 1,
  };
  if (cursor) {
    queryArgs.cursor = { id: cursor };
    queryArgs.skip = 1;
  }

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
});
