import { exec } from 'child_process';
import { promisify } from 'util';

import { contract, JOB_STATUS, JOB_TYPE } from '@acme/contracts';
import { jobsRepo, JobListItemFromRepo } from '@acme/db';
import { createRouteHandler } from '@/lib/ts-rest/next-handler';

import { getSessionInfo } from '@/lib/utils/apiAuth';

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
  createJob: async ({ body, req }) => {
    const { tenantId, userId, userName } = await getSessionInfo();

    const job = await jobsRepo.create({
      tenantId,
      userId,
      userName,
      type: body.type,
      payload: body.payload as any,
      srcImagePath: body.srcImagePath,
      imageUrl: body.srcImagePath,
      params: body.payload as any,
      ip: (req.headers['x-forwarded-for'] as string) ?? '127.0.0.1',
      ua: (req.headers['user-agent'] as string) ?? undefined,
    });

    // Do not await this, let it run in the background
    processJob(job.id);

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
  getJobs: async ({ query }) => {
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
  deleteJob: async ({ params }) => {
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
