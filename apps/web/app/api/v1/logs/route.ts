import { NextRequest } from 'next/server';

import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract, JOB_TYPE } from '@acme/contracts';
import {
  GetLogsQuery,
  GetLogsResponse,
  JobCreateRequest,
  JobCreateResponse,
  LogItem,
} from '@acme/contracts/schemas/logs';
import { jobsRepo, FindJobsQuery } from '@acme/db';
import type { Job } from '@prisma/client';
import { getSessionInfo } from '@/lib/utils/apiAuth';

const router = createRouteHandler(contract.logs, {
  getLogs: async ({ query }: { query: GetLogsQuery }) => {
    try {
      const { tenantId } = await getSessionInfo();
      const { filter, search, startDate, endDate, cursor, limit } = query;

      const filters: FindJobsQuery = {
        tenantId,
        filter,
        search,
        startDate,
        endDate,
        cursor,
        limit: limit + 1,
      };

      const result = await jobsRepo.findMany(filters);

      const hasNextPage = result.jobs.length > limit;
      const jobsPage = hasNextPage ? result.jobs.slice(0, limit) : result.jobs;

      const jobs: LogItem[] = (jobsPage as unknown as Job[]).map((job: Job) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        tenantId: job.tenantId,
        userId: job.userId,
        userName: job.userName,
        srcImagePath: job.srcImagePath,
        imageUrl: job.imageUrl,
        thumbnailPath: job.thumbnailPath,
        params: (job.params as Record<string, unknown>) ?? {},
        result: (job.result as Record<string, unknown>) ?? {},
        startedAt: job.startedAt?.toISOString() || job.createdAt.toISOString(),
        finishedAt: job.finishedAt?.toISOString() || null,
        durationMs: job.durationMs ?? null,
        ip: job.ip ?? null,
        ua: job.ua ?? null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      }));

      return {
        status: 200,
        body: {
          jobs,
          nextCursor: hasNextPage ? jobsPage[jobsPage.length - 1].id : null,
          hasNextPage,
        } satisfies GetLogsResponse,
      };
    } catch (error) {
      console.error('Logs API error:', error);
      return {
        status: 500,
        body: {
          jobs: [],
          nextCursor: null,
          hasNextPage: false,
        } satisfies GetLogsResponse,
      };
    }
  },
  createJob: async ({ body, req }: { body: JobCreateRequest; req: NextRequest }) => {
    try {
      const { tenantId, userId, userName } = await getSessionInfo();

      const job = await jobsRepo.create({
        tenantId,
        userId,
        userName,
        type: body.type,
        payload: body,
        srcImagePath: body.srcImagePath,
        imageUrl: body.srcImagePath,
        params: body.params || {},
        ip: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
        ua: req.headers.get('user-agent') ?? undefined,
      });

      const response: JobCreateResponse = {
        id: job.id,
        type: job.type,
        status: job.status,
        tenantId,
        userId,
        userName,
        srcImagePath: body.srcImagePath,
        imageUrl: body.srcImagePath,
        createdAt: job.createdAt.toISOString(),
      };

      return {
        status: 201,
        body: response,
      };
    } catch (error) {
      console.error('Create Job API error:', error);
      const empty: JobCreateResponse = {
        id: '',
        type: '',
        status: '',
        tenantId: '',
        userId: '',
        userName: '',
        srcImagePath: '',
        imageUrl: '',
        createdAt: '',
      };
      return {
        status: 500,
        body: empty,
      };
    }
  },
});

export const GET = router.getLogs;
export const POST = router.createJob;
