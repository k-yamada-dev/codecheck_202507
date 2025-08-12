import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, JobType, JobStatus, Prisma } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { CreateJobRequestSchema, GetJobsQuerySchema } from '@/app/api/_schemas/jobs';
import { withErrorHandling } from '@/lib/errors/apiHandler';
// import { jobCreateDataSchema } from '@/lib/dto/JobCreateDataDTO';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

// const searchParamsSchema = z.object({
//   filter: z.enum(['all', 'embed', 'decode']).optional().default('all'),
//   search: z.string().optional(),
//   startDate: z.string().datetime().optional(),
//   endDate: z.string().datetime().optional(),
//   cursor: z.string().uuid().optional(),
//   limit: z.coerce.number().int().min(1).max(100).optional().default(50),
// });

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const jobData = CreateJobRequestSchema.parse(body);

  const { tenantId, userId, userName } = await getSessionInfo();

  const created = await prisma.job.create({
    data: {
      ...jobData,
      tenantId,
      userId,
      userName,
      imageUrl: jobData.srcImagePath, // Add imageUrl from srcImagePath
      status: JobStatus.PENDING,
      result: {},
      ip: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
      ua: req.headers.get('user-agent'),
    },
  });

  // Do not await this, let it run in the background
  processJob(created.id);

  return NextResponse.json(
    {
      ...created,
      userName,
    },
    { status: 201 }
  );
});

async function processJob(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    console.error(`[processJob] Job with ID ${jobId} not found.`);
    return;
  }

  const startTime = Date.now();
  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.RUNNING },
  });

  try {
    // This is a simplified command generation.
    // In a real app, you'd have a more robust way to build this
    // and handle different job types and parameters.
    const command =
      job.type === JobType.EMBED
        ? `echo "Simulating embed for ${job.srcImagePath} with params ${JSON.stringify(job.params)}"`
        : `echo "Simulating decode for ${job.srcImagePath}"`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      throw new Error(stderr);
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startTime;

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.DONE,
        finishedAt,
        durationMs,
        result: { output: stdout.trim() },
      },
    });
  } catch (error) {
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startTime;
    console.error(
      `[processJob] Updating job ${jobId} status to ERROR. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.ERROR,
        finishedAt,
        durationMs,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
    });
    console.error(`[processJob] Failed to process job ${jobId}:`, error);
  }
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { tenantId } = await getSessionInfo();
  const { searchParams } = new URL(req.url);

  // UUID形式のみ許容し、それ以外はundefined扱いにする
  const rawCursor = searchParams.get('cursor');
  const cursor =
    rawCursor &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawCursor)
      ? rawCursor
      : undefined;

  // Parse and validate query parameters using generated schema
  const queryParams = GetJobsQuerySchema.parse({
    filter: searchParams.get('filter') || 'all',
    search: searchParams.get('search') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    cursor,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    userId: searchParams.get('userId') || undefined,
  });

  const { filter, search, startDate, endDate, cursor: queryCursor, userId } = queryParams;
  const limit = queryParams.limit ?? 50; // Ensure limit is never undefined

  const where: Prisma.JobWhereInput = {
    tenantId,
  };

  if (userId) {
    where.userId = userId;
  }

  if (filter !== 'all') {
    where.type = filter === 'embed' ? JobType.EMBED : JobType.DECODE;
  }

  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) where.startedAt.gte = new Date(startDate);
    if (endDate) where.startedAt.lte = new Date(endDate);
  }

  if (search) {
    // This is a basic search. For production, consider pg_trgm or a dedicated search service.
    where.OR = [
      // { id: { contains: search, mode: 'insensitive' } }, // ID is a UUID, 'contains' is not supported.
      // { user: { name: { contains: search, mode: 'insensitive' } } }, // Needs relation
      { params: { path: ['watermark_text'], string_contains: search } },
      { result: { path: ['detected_text'], string_contains: search } },
    ];
  }
  const queryArgs: Prisma.JobFindManyArgs = {
    where,
    orderBy: { startedAt: 'desc' },
    take: limit + 1,
  };
  if (queryCursor) {
    queryArgs.cursor = { id: queryCursor };
    queryArgs.skip = 1;
  }

  const jobs = await prisma.job.findMany(queryArgs);

  const hasNextPage = jobs.length > limit;
  const jobsPage = hasNextPage ? jobs.slice(0, limit) : jobs;

  return NextResponse.json({
    jobs: jobsPage,
    nextCursor: hasNextPage ? jobsPage[jobsPage.length - 1].id : null,
    hasNextPage,
  });
});
