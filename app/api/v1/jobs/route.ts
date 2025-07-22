import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, JobType, JobStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import createHttpError from 'http-errors';
import { getSessionInfo } from '@/app/utils/apiAuth';
import { JobCreateRequestDTOImpl } from '@/app/dto/JobCreateRequestDTO';
import { JobCreateDataDTOImpl } from '@/app/dto/JobCreateDataDTO';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

function problemJson(type: string, title: string, status: number, detail?: string) {
  return {
    type,
    title,
    status,
    detail,
  };
}

const searchParamsSchema = z.object({
  filter: z.enum(['all', 'embed', 'decode']).optional().default('all'),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

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
    console.log('POST /api/v1/jobs called with validated DTO:', jobData);

    const { tenantId, userId, userName } = await getSessionInfo();
    const jobDataDTO = new JobCreateDataDTOImpl(
      jobData.type,
      jobData.srcImagePath,
      jobData.params,
      tenantId,
      userId,
      userName,
      jobData.thumbnailPath
    );

    const created = await prisma.job.create({
      data: {
        ...jobDataDTO,
        status: JobStatus.PENDING,
        result: {},
        ip: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
        ua: req.headers.get('user-agent'),
      },
    });

    // Do not await this, let it run in the background
    processJob(created.id);

    return NextResponse.json({
      ...created,
      userName,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/v1/jobs:', err);
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}

async function processJob(jobId: string) {
  console.log(`[processJob] Starting job processing for ID: ${jobId}`);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    console.error(`[processJob] Job with ID ${jobId} not found.`);
    return;
  }

  const startTime = Date.now();
  console.log(`[processJob] Updating job ${jobId} status to RUNNING`);
  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.RUNNING },
  });

  try {
    // This is a simplified command generation.
    // In a real app, you'd have a more robust way to build this
    // and handle different job types and parameters.
    const command = job.type === JobType.EMBED
      ? `echo "Simulating embed for ${job.srcImagePath} with params ${JSON.stringify(job.params)}"`
      : `echo "Simulating decode for ${job.srcImagePath}"`;

    console.log(`[processJob] Executing command for job ${jobId}: ${command}`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      throw new Error(stderr);
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startTime;

    console.log(`[processJob] Updating job ${jobId} status to DONE. Output: ${stdout.trim()}`);
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
    console.error(`[processJob] Updating job ${jobId} status to ERROR. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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


export async function GET(req: NextRequest) {
  try {
    const { tenantId } = await getSessionInfo();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') ?? 'all';
    const search = searchParams.get('search') ?? '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const cursor = searchParams.get('cursor');
    const limit = Number(searchParams.get('limit') ?? 50);
    const userId = searchParams.get('userId');

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
    console.log('GET /api/v1/jobs: where clause', where);
    const queryArgs: any = {
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

    return NextResponse.json({
      jobs: jobsPage,
      nextCursor: hasNextPage ? jobsPage[jobsPage.length - 1].id : null,
      hasNextPage,
    });
  } catch (err: any) {
    console.error('Failed to fetch jobs:', err);
    return NextResponse.json(
      problemJson('about:blank', err.message || 'Internal Server Error', 500),
      { status: 500 }
    );
  }
}
