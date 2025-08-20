import { Prisma, Job, JobType } from '@prisma/client';
import { prisma } from '../client';

// Type for the data required to create a job
export type CreateJobData = {
  tenantId: string;
  userId: string;
  userName: string;
  type: 'EMBED' | 'DECODE';
  payload: Prisma.JsonObject;
  srcImagePath: string;
  imageUrl: string;
  params: Prisma.JsonObject;
  ip?: string | null;
  ua?: string | null;
};

// Type for updating a job's status and result
export type UpdateJobResultData = {
  status: 'RUNNING' | 'DONE' | 'ERROR';
  finishedAt?: Date;
  durationMs?: number;
  result?: Prisma.JsonObject;
};

// Type for findMany query options
export type FindJobsQuery = {
  tenantId: string;
  userId?: string;
  filter?: 'all' | 'embed' | 'decode';
  search?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
};

// Define the shape of the data returned by findMany's select clause
const jobListItemSelect = {
  id: true,
  type: true,
  status: true,
  createdAt: true,
  srcImagePath: true,
  thumbnailPath: true,
  params: true,
} satisfies Prisma.JobSelect;

// Export the inferred type for use in the API layer
export type JobListItemFromRepo = Prisma.JobGetPayload<{ select: typeof jobListItemSelect }>;

export const jobsRepo = {
  /**
   * Creates a new job in the database.
   */
  create: (data: CreateJobData) => {
    return prisma.job.create({
      data: {
        ...data,
        status: 'PENDING',
        result: {},
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });
  },

  /**
   * Finds a single job by its ID.
   */
  findById: (id: string): Promise<Job | null> => {
    return prisma.job.findUnique({ where: { id } });
  },

  /**
   * Updates a job's status, timing, and result.
   */
  updateResult: (id: string, data: UpdateJobResultData) => {
    return prisma.job.update({
      where: { id },
      data,
    });
  },

  /**
   * Finds multiple jobs with filtering and pagination.
   */
  findMany: async ({
    tenantId,
    userId,
    filter,
    search,
    startDate,
    endDate,
    cursor,
    limit = 50,
  }: FindJobsQuery): Promise<{
    jobs: JobListItemFromRepo[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> => {
    const where: Prisma.JobWhereInput = { tenantId };

    if (userId) where.userId = userId;
    if (filter && filter !== 'all') {
      where.type = filter === 'embed' ? JobType.EMBED : JobType.DECODE;
    }
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(startDate);
      if (endDate) where.startedAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { params: { path: ['watermark_text'], string_contains: search } },
        { result: { path: ['detected_text'], string_contains: search } },
      ];
    }

    const queryArgs: Prisma.JobFindManyArgs = {
      where,
      orderBy: { startedAt: 'desc' },
      take: limit + 1,
      select: jobListItemSelect,
    };
    if (cursor) {
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1;
    }

    const jobs = await prisma.job.findMany(queryArgs);

    const hasNextPage = jobs.length > limit;
    const jobsPage = hasNextPage ? jobs.slice(0, limit) : jobs;
    const nextCursor = hasNextPage ? jobsPage[jobsPage.length - 1].id : null;

    return { jobs: jobsPage, nextCursor, hasNextPage };
  },

  /**
   * Deletes a job by its ID.
   */
  delete: (id: string) => {
    return prisma.job.delete({
      where: { id },
    });
  },
};
