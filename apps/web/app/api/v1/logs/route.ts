import { NextRequest } from 'next/server';

import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract } from '@acme/contracts';
import {
  GetLogsQuery,
  GetLogsResponse,
  JobCreateRequest,
  JobCreateResponse,
  LogItem,
} from '@acme/contracts/schemas/logs';
import { jobsRepo, FindJobsQuery, JobListItemFromRepo } from '@acme/db';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { normalizeError } from '@/lib/errors/core';

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

      const jobs: LogItem[] = jobsPage.map((job: JobListItemFromRepo) => ({
        ...job,
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
      const err = normalizeError(error);
      console.error('Logs API error:', err);
      return {
        status: err.status,
        body: {
          jobs: [],
          nextCursor: null,
          hasNextPage: false,
        } satisfies GetLogsResponse,
      };
    }
  },
  createJob: async ({
    body,
    req,
  }: {
    body: JobCreateRequest;
    req: NextRequest;
  }) => {
    try {
      const { tenantId, userId, userName } = await getSessionInfo();

      const job = await jobsRepo.create({
        tenantId,
        userId,
        userName,
        type: body.type,
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
      const err = normalizeError(error);
      console.error('Create Job API error:', err);

      // ts-restの型を満たすためのダミーレスポンス。本来はコントラクトにエラー型を定義すべき
      const errorResponse: JobCreateResponse = {
        id: '',
        type: body.type ?? 'unknown',
        status: 'error',
        tenantId: '',
        userId: '',
        userName: '',
        srcImagePath: body.srcImagePath ?? '',
        imageUrl: body.srcImagePath ?? '',
        createdAt: new Date().toISOString(),
      };

      return {
        status: err.status,
        body: errorResponse,
      };
    }
  },
});

export const GET = router.getLogs;
export const POST = router.createJob;
