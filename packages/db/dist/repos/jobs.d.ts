import { Prisma, Job } from '@prisma/client';
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
export type UpdateJobResultData = {
    status: 'RUNNING' | 'DONE' | 'ERROR';
    finishedAt?: Date;
    durationMs?: number;
    result?: Prisma.JsonObject;
};
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
declare const jobListItemSelect: {
    id: true;
    type: true;
    status: true;
    createdAt: true;
    srcImagePath: true;
    thumbnailPath: true;
    params: true;
};
export type JobListItemFromRepo = Prisma.JobGetPayload<{
    select: typeof jobListItemSelect;
}>;
export declare const jobsRepo: {
    /**
     * Creates a new job in the database.
     */
    create: (data: CreateJobData) => Prisma.Prisma__JobClient<{
        id: string;
        type: import("@prisma/client").$Enums.JobType;
        status: import("@prisma/client").$Enums.JobStatus;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    /**
     * Finds a single job by its ID.
     */
    findById: (id: string) => Promise<Job | null>;
    /**
     * Updates a job's status, timing, and result.
     */
    updateResult: (id: string, data: UpdateJobResultData) => Prisma.Prisma__JobClient<{
        result: Prisma.JsonValue;
        id: string;
        tenantId: string;
        userId: string;
        userName: string;
        type: import("@prisma/client").$Enums.JobType;
        status: import("@prisma/client").$Enums.JobStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationMs: number | null;
        thumbnailPath: string | null;
        srcImagePath: string;
        params: Prisma.JsonValue;
        errorCode: string | null;
        errorMessage: string | null;
        ip: string | null;
        ua: string | null;
        isArchived: boolean;
        archivedAt: Date | null;
        imageUrl: string;
        resultUrl: string | null;
        watermark: string | null;
        confidence: number | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    /**
     * Finds multiple jobs with filtering and pagination.
     */
    findMany: ({ tenantId, userId, filter, search, startDate, endDate, cursor, limit, }: FindJobsQuery) => Promise<{
        jobs: JobListItemFromRepo[];
        nextCursor: string | null;
        hasNextPage: boolean;
    }>;
    /**
     * Deletes a job by its ID.
     */
    delete: (id: string) => Prisma.Prisma__JobClient<{
        result: Prisma.JsonValue;
        id: string;
        tenantId: string;
        userId: string;
        userName: string;
        type: import("@prisma/client").$Enums.JobType;
        status: import("@prisma/client").$Enums.JobStatus;
        startedAt: Date;
        finishedAt: Date | null;
        durationMs: number | null;
        thumbnailPath: string | null;
        srcImagePath: string;
        params: Prisma.JsonValue;
        errorCode: string | null;
        errorMessage: string | null;
        ip: string | null;
        ua: string | null;
        isArchived: boolean;
        archivedAt: Date | null;
        imageUrl: string;
        resultUrl: string | null;
        watermark: string | null;
        confidence: number | null;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
};
export {};
