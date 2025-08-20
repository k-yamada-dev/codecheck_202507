import { z } from 'zod';
/**
 * @description DTO for creating a new job.
 * `srcImagePath` is required, and other parameters can be passed in `payload`.
 */
export declare const CreateJobRequestSchema: z.ZodObject<{
    type: z.ZodEnum<["EMBED", "DECODE"]>;
    srcImagePath: z.ZodString;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "EMBED" | "DECODE";
    srcImagePath: string;
    payload: Record<string, unknown>;
}, {
    type: "EMBED" | "DECODE";
    srcImagePath: string;
    payload?: Record<string, unknown> | undefined;
}>;
/**
 * @description DTO for the simple job resource returned after creation.
 */
export declare const JobResponseSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["EMBED", "DECODE"]>;
    status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "EMBED" | "DECODE";
    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
    id: string;
    createdAt: string;
}, {
    type: "EMBED" | "DECODE";
    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
    id: string;
    createdAt: string;
}>;
/**
 * @description DTO for a job item in a list, containing more details for UI.
 */
export declare const JobListItemSchema: z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodString;
    type: z.ZodEnum<["EMBED", "DECODE"]>;
    status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
    createdAt: z.ZodString;
}, {
    srcImagePath: z.ZodNullable<z.ZodString>;
    thumbnailPath: z.ZodNullable<z.ZodString>;
    params: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}>, "strip", z.ZodTypeAny, {
    params: Record<string, unknown> | null;
    type: "EMBED" | "DECODE";
    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
    srcImagePath: string | null;
    id: string;
    createdAt: string;
    thumbnailPath: string | null;
}, {
    params: Record<string, unknown> | null;
    type: "EMBED" | "DECODE";
    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
    srcImagePath: string | null;
    id: string;
    createdAt: string;
    thumbnailPath: string | null;
}>;
export declare const GetJobsQuerySchema: z.ZodObject<{
    filter: z.ZodOptional<z.ZodDefault<z.ZodEnum<["all", "embed", "decode"]>>>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    endDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filter?: "all" | "embed" | "decode" | undefined;
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cursor?: string | undefined;
    limit?: number | undefined;
    userId?: string | undefined;
}, {
    filter?: "all" | "embed" | "decode" | undefined;
    search?: string | undefined;
    startDate?: unknown;
    endDate?: unknown;
    cursor?: string | undefined;
    limit?: number | undefined;
    userId?: string | undefined;
}>;
export declare const GetJobsResponseSchema: z.ZodObject<{
    jobs: z.ZodArray<z.ZodObject<z.objectUtil.extendShape<{
        id: z.ZodString;
        type: z.ZodEnum<["EMBED", "DECODE"]>;
        status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
        createdAt: z.ZodString;
    }, {
        srcImagePath: z.ZodNullable<z.ZodString>;
        thumbnailPath: z.ZodNullable<z.ZodString>;
        params: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }>, "strip", z.ZodTypeAny, {
        params: Record<string, unknown> | null;
        type: "EMBED" | "DECODE";
        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
        srcImagePath: string | null;
        id: string;
        createdAt: string;
        thumbnailPath: string | null;
    }, {
        params: Record<string, unknown> | null;
        type: "EMBED" | "DECODE";
        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
        srcImagePath: string | null;
        id: string;
        createdAt: string;
        thumbnailPath: string | null;
    }>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
    hasNextPage: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    jobs: {
        params: Record<string, unknown> | null;
        type: "EMBED" | "DECODE";
        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
        srcImagePath: string | null;
        id: string;
        createdAt: string;
        thumbnailPath: string | null;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
}, {
    jobs: {
        params: Record<string, unknown> | null;
        type: "EMBED" | "DECODE";
        status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
        srcImagePath: string | null;
        id: string;
        createdAt: string;
        thumbnailPath: string | null;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
}>;
export declare const DeleteJobResponseSchema: z.ZodObject<{
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
}, {
    message: string;
}>;
export declare const JobsApiMeta: {
    readonly createJob: {
        readonly method: "POST";
        readonly path: "/api/v1/jobs";
        readonly summary: "Create a new job";
        readonly description: "Creates a new watermark embedding or decoding job";
        readonly body: z.ZodObject<{
            type: z.ZodEnum<["EMBED", "DECODE"]>;
            srcImagePath: z.ZodString;
            payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "EMBED" | "DECODE";
            srcImagePath: string;
            payload: Record<string, unknown>;
        }, {
            type: "EMBED" | "DECODE";
            srcImagePath: string;
            payload?: Record<string, unknown> | undefined;
        }>;
        readonly responses: {
            readonly 201: z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["EMBED", "DECODE"]>;
                status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
                createdAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: "EMBED" | "DECODE";
                status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                id: string;
                createdAt: string;
            }, {
                type: "EMBED" | "DECODE";
                status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                id: string;
                createdAt: string;
            }>;
        };
        readonly tags: readonly ["jobs"];
    };
    readonly getJobs: {
        readonly method: "GET";
        readonly path: "/api/v1/jobs";
        readonly summary: "Get jobs list";
        readonly description: "Retrieves a paginated list of jobs with optional filtering";
        readonly query: z.ZodObject<{
            filter: z.ZodOptional<z.ZodDefault<z.ZodEnum<["all", "embed", "decode"]>>>;
            search: z.ZodOptional<z.ZodString>;
            startDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
            endDate: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
            cursor: z.ZodOptional<z.ZodString>;
            limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
            userId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            filter?: "all" | "embed" | "decode" | undefined;
            search?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cursor?: string | undefined;
            limit?: number | undefined;
            userId?: string | undefined;
        }, {
            filter?: "all" | "embed" | "decode" | undefined;
            search?: string | undefined;
            startDate?: unknown;
            endDate?: unknown;
            cursor?: string | undefined;
            limit?: number | undefined;
            userId?: string | undefined;
        }>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                jobs: z.ZodArray<z.ZodObject<z.objectUtil.extendShape<{
                    id: z.ZodString;
                    type: z.ZodEnum<["EMBED", "DECODE"]>;
                    status: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
                    createdAt: z.ZodString;
                }, {
                    srcImagePath: z.ZodNullable<z.ZodString>;
                    thumbnailPath: z.ZodNullable<z.ZodString>;
                    params: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                }>, "strip", z.ZodTypeAny, {
                    params: Record<string, unknown> | null;
                    type: "EMBED" | "DECODE";
                    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                    srcImagePath: string | null;
                    id: string;
                    createdAt: string;
                    thumbnailPath: string | null;
                }, {
                    params: Record<string, unknown> | null;
                    type: "EMBED" | "DECODE";
                    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                    srcImagePath: string | null;
                    id: string;
                    createdAt: string;
                    thumbnailPath: string | null;
                }>, "many">;
                nextCursor: z.ZodNullable<z.ZodString>;
                hasNextPage: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                jobs: {
                    params: Record<string, unknown> | null;
                    type: "EMBED" | "DECODE";
                    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                    srcImagePath: string | null;
                    id: string;
                    createdAt: string;
                    thumbnailPath: string | null;
                }[];
                nextCursor: string | null;
                hasNextPage: boolean;
            }, {
                jobs: {
                    params: Record<string, unknown> | null;
                    type: "EMBED" | "DECODE";
                    status: "PENDING" | "RUNNING" | "DONE" | "ERROR";
                    srcImagePath: string | null;
                    id: string;
                    createdAt: string;
                    thumbnailPath: string | null;
                }[];
                nextCursor: string | null;
                hasNextPage: boolean;
            }>;
        };
        readonly tags: readonly ["jobs"];
    };
    readonly deleteJob: {
        readonly method: "DELETE";
        readonly path: "/api/v1/jobs/:id";
        readonly summary: "Delete a job";
        readonly description: "Deletes a job by its ID";
        readonly pathParams: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
        readonly body: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
        readonly tags: readonly ["jobs"];
    };
};
export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;
export type JobResponse = z.infer<typeof JobResponseSchema>;
export type JobListItem = z.infer<typeof JobListItemSchema>;
export type GetJobsQuery = z.infer<typeof GetJobsQuerySchema>;
export type GetJobsResponse = z.infer<typeof GetJobsResponseSchema>;
export type DeleteJobResponse = z.infer<typeof DeleteJobResponseSchema>;
