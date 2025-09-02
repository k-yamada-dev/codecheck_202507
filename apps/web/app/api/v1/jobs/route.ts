import { exec } from 'child_process';
import { promisify } from 'util';
import { NextRequest } from 'next/server';

import {
  contract,
  JOB_STATUS,
  JOB_TYPE,
  GetJobsQuery,
  DeleteJobParams,
  CreateJobRequest,
} from '@acme/contracts';
import { jobsRepo, JobListItemFromRepo, JsonObject } from '@acme/db';
import { createRouteHandler } from '@/lib/ts-rest/next-handler';

import { getSessionInfo } from '@/lib/utils/apiAuth';
import { publishJob } from '@/lib/pubsub';

const execAsync = promisify(exec);

async function processJob(jobId: string) {
  const job = await jobsRepo.findById(jobId);
  if (!job) {
    console.error(`[processJob] Job with ID ${jobId} not found.`);
    return;
  }

  const startTime = Date.now();
  await jobsRepo.updateResult(jobId, { status: JOB_STATUS.RUNNING });

  try {
    const command =
      job.type === JOB_TYPE.EMBED
        ? `echo "Simulating embed for ${job.srcImagePath} with params ${JSON.stringify(
            job.params
          )}"`
        : `echo "Simulating decode for ${job.srcImagePath}"`;

    const { stdout, stderr } = await execAsync(command);
    if (stderr) throw new Error(stderr);

    const finishedAt = new Date();
    await jobsRepo.updateResult(jobId, {
      status: JOB_STATUS.DONE,
      finishedAt,
      durationMs: finishedAt.getTime() - startTime,
      result: { output: stdout.trim() },
    });
  } catch (error) {
    const finishedAt = new Date();
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`[processJob] Failed to process job ${jobId}:`, error);
    await jobsRepo.updateResult(jobId, {
      status: JOB_STATUS.ERROR,
      finishedAt,
      durationMs: finishedAt.getTime() - startTime,
      result: { error: errorMessage },
    });
  }
}

const router = createRouteHandler(contract.jobs, {
  createJob: async ({
    body,
    req,
  }: {
    body: CreateJobRequest;
    req: NextRequest;
  }) => {
    const { tenantId, userId, userName } = await getSessionInfo();

    // Accept thumbnailPath either as a top-level field or embedded in params.thumbnailPath
    const thumbnailPathFromParams = (
      (body.params ?? {}) as Record<string, unknown>
    )?.thumbnailPath as string | null | undefined;
    const thumbnailPath = body.thumbnailPath ?? thumbnailPathFromParams ?? null;

    const job = await jobsRepo.create({
      tenantId,
      userId,
      userName,
      type: body.type,
      srcImagePath: body.srcImagePath,
      imageUrl: body.srcImagePath,
      thumbnailPath,
      params: (body.params ?? {}) as JsonObject,
      ip: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
      ua: req.headers.get('user-agent') ?? undefined,
    });

    // Publish to Pub/Sub so worker processes it asynchronously.
    // If publish fails, fallback to local processing.
    try {
      await publishJob({ jobId: job.id, tenantId });
      console.log(`Published job ${job.id} to Pub/Sub.`);
    } catch (err) {
      console.error(
        'Failed to publish job to Pub/Sub, falling back to local processing:',
        err
      );
      // Do not await to preserve original behavior
      processJob(job.id);
    }

    const response = {
      id: job.id,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
    };

    return {
      status: 201,
      body: response,
    };
  },
  getJobs: async ({ query }: { query: GetJobsQuery }) => {
    const { tenantId } = await getSessionInfo();

    const result = await jobsRepo.findMany({ tenantId, ...query });

    const responseJobs = result.jobs.map((job: JobListItemFromRepo) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      srcImagePath: job.srcImagePath,
      thumbnailPath: job.thumbnailPath,
      params: job.params as Record<string, unknown> | null,
    }));

    return {
      status: 200,
      body: {
        jobs: responseJobs,
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
      },
    };
  },
  deleteJob: async ({ params }: { params: DeleteJobParams }) => {
    const { tenantId } = await getSessionInfo();

    // Check if job exists and belongs to the tenant
    const job = await jobsRepo.findById(params.id);
    if (!job || job.tenantId !== tenantId) {
      return {
        status: 404,
        body: { message: 'Job not found' },
      };
    }

    await jobsRepo.delete(params.id);

    return {
      status: 200,
      body: { message: 'Job deleted successfully' },
    };
  },
});

export const GET = router.getJobs;
export const POST = router.createJob;
export const DELETE = router.deleteJob;
