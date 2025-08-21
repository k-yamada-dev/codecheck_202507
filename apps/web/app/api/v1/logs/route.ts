import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import { contract, JOB_TYPE, JOB_STATUS } from '@acme/contracts';
import { jobsRepo } from '@acme/db';
import { getSessionInfo } from '@/lib/utils/apiAuth';

const router = createRouteHandler(contract.logs, {
  getLogs: async ({ query }: { query: any }) => {
    try {
      const { tenantId } = await getSessionInfo();
      const { filter, search, startDate, endDate, cursor, limit } = query;

      // Build filter conditions
      const filters: any = {
        tenantId,
      };

      // Add type filter
      if (filter !== 'all') {
        filters.type = filter === 'embed' ? JOB_TYPE.EMBED : JOB_TYPE.DECODE;
      }

      // Add search filter
      if (search) {
        filters.search = search;
      }

      // Add date range filter
      if (startDate || endDate) {
        filters.dateRange = { startDate, endDate };
      }

      // Add cursor for pagination
      if (cursor) {
        filters.cursor = cursor;
      }

      const result = await jobsRepo.findMany({
        ...filters,
        limit: limit + 1, // Get one extra to check if there's a next page
        sortBy: 'startedAt',
        sortOrder: 'desc',
      });

      const hasNextPage = result.jobs.length > limit;
      const jobsPage = hasNextPage ? result.jobs.slice(0, limit) : result.jobs;

      const jobs = jobsPage.map((job: any) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        tenantId: job.tenantId,
        userId: job.userId,
        userName: job.userName,
        srcImagePath: job.srcImagePath,
        imageUrl: job.imageUrl,
        thumbnailPath: job.thumbnailPath,
        params: job.params || {},
        result: job.result || {},
        startedAt: job.startedAt?.toISOString() || job.createdAt.toISOString(),
        finishedAt: job.finishedAt?.toISOString() || null,
        durationMs: job.durationMs,
        ip: job.ip,
        ua: job.ua,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      }));

      return {
        status: 200,
        body: {
          jobs,
          nextCursor: hasNextPage ? jobsPage[jobsPage.length - 1].id : null,
          hasNextPage,
        },
      };
    } catch (error) {
      console.error('Logs API error:', error);
      return {
        status: 500,
        body: {
          jobs: [],
          nextCursor: null,
          hasNextPage: false,
        },
      };
    }
  },
  createJob: async ({ body, req }: { body: any; req: any }) => {
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
        ip: req.headers['x-forwarded-for'] || '127.0.0.1',
        ua: req.headers['user-agent'] || undefined,
      });

      return {
        status: 201,
        body: {
          id: job.id,
          type: job.type,
          status: job.status,
          tenantId,
          userId,
          userName,
          srcImagePath: body.srcImagePath,
          imageUrl: body.srcImagePath,
          createdAt: job.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('Create Job API error:', error);
      return {
        status: 500,
        body: {
          id: '',
          type: '',
          status: '',
          tenantId: '',
          userId: '',
          userName: '',
          srcImagePath: '',
          imageUrl: '',
          createdAt: '',
        },
      };
    }
  },
});

export const GET = router.getLogs;
export const POST = router.createJob;
