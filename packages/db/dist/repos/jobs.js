import { JobType } from '@prisma/client';
import { prisma } from '../client';
// Define the shape of the data returned by findMany's select clause
const jobListItemSelect = {
    id: true,
    type: true,
    status: true,
    createdAt: true,
    srcImagePath: true,
    thumbnailPath: true,
    params: true,
};
export const jobsRepo = {
    /**
     * Creates a new job in the database.
     */
    create: (data) => {
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
    findById: (id) => {
        return prisma.job.findUnique({ where: { id } });
    },
    /**
     * Updates a job's status, timing, and result.
     */
    updateResult: (id, data) => {
        return prisma.job.update({
            where: { id },
            data,
        });
    },
    /**
     * Finds multiple jobs with filtering and pagination.
     */
    findMany: async ({ tenantId, userId, filter, search, startDate, endDate, cursor, limit = 50, }) => {
        const where = { tenantId };
        if (userId)
            where.userId = userId;
        if (filter && filter !== 'all') {
            where.type = filter === 'embed' ? JobType.EMBED : JobType.DECODE;
        }
        if (startDate || endDate) {
            where.startedAt = {};
            if (startDate)
                where.startedAt.gte = new Date(startDate);
            if (endDate)
                where.startedAt.lte = new Date(endDate);
        }
        if (search) {
            where.OR = [
                { params: { path: ['watermark_text'], string_contains: search } },
                { result: { path: ['detected_text'], string_contains: search } },
            ];
        }
        const queryArgs = {
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
    delete: (id) => {
        return prisma.job.delete({
            where: { id },
        });
    },
};
