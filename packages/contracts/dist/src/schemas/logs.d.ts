import { z } from 'zod';
export declare const GetLogsQuerySchema: z.ZodObject<{
    filter: z.ZodDefault<z.ZodEnum<["all", "embed", "decode"]>>;
    search: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    filter: "all" | "embed" | "decode";
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cursor?: string | undefined;
}, {
    limit?: number | undefined;
    search?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    filter?: "all" | "embed" | "decode" | undefined;
    cursor?: string | undefined;
}>;
export declare const LogItemSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    status: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodString;
    userName: z.ZodString;
    srcImagePath: z.ZodString;
    imageUrl: z.ZodString;
    thumbnailPath: z.ZodNullable<z.ZodString>;
    params: z.ZodRecord<z.ZodString, z.ZodAny>;
    result: z.ZodRecord<z.ZodString, z.ZodAny>;
    startedAt: z.ZodString;
    finishedAt: z.ZodNullable<z.ZodString>;
    durationMs: z.ZodNullable<z.ZodNumber>;
    ip: z.ZodNullable<z.ZodString>;
    ua: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    userName: string;
    srcImagePath: string;
    userId: string;
    params: Record<string, any>;
    type: string;
    status: string;
    id: string;
    thumbnailPath: string | null;
    tenantId: string;
    imageUrl: string;
    result: Record<string, any>;
    startedAt: string;
    finishedAt: string | null;
    durationMs: number | null;
    ip: string | null;
    ua: string | null;
}, {
    createdAt: string;
    updatedAt: string;
    userName: string;
    srcImagePath: string;
    userId: string;
    params: Record<string, any>;
    type: string;
    status: string;
    id: string;
    thumbnailPath: string | null;
    tenantId: string;
    imageUrl: string;
    result: Record<string, any>;
    startedAt: string;
    finishedAt: string | null;
    durationMs: number | null;
    ip: string | null;
    ua: string | null;
}>;
export declare const GetLogsResponseSchema: z.ZodObject<{
    jobs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        status: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodString;
        userName: z.ZodString;
        srcImagePath: z.ZodString;
        imageUrl: z.ZodString;
        thumbnailPath: z.ZodNullable<z.ZodString>;
        params: z.ZodRecord<z.ZodString, z.ZodAny>;
        result: z.ZodRecord<z.ZodString, z.ZodAny>;
        startedAt: z.ZodString;
        finishedAt: z.ZodNullable<z.ZodString>;
        durationMs: z.ZodNullable<z.ZodNumber>;
        ip: z.ZodNullable<z.ZodString>;
        ua: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        userName: string;
        srcImagePath: string;
        userId: string;
        params: Record<string, any>;
        type: string;
        status: string;
        id: string;
        thumbnailPath: string | null;
        tenantId: string;
        imageUrl: string;
        result: Record<string, any>;
        startedAt: string;
        finishedAt: string | null;
        durationMs: number | null;
        ip: string | null;
        ua: string | null;
    }, {
        createdAt: string;
        updatedAt: string;
        userName: string;
        srcImagePath: string;
        userId: string;
        params: Record<string, any>;
        type: string;
        status: string;
        id: string;
        thumbnailPath: string | null;
        tenantId: string;
        imageUrl: string;
        result: Record<string, any>;
        startedAt: string;
        finishedAt: string | null;
        durationMs: number | null;
        ip: string | null;
        ua: string | null;
    }>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
    hasNextPage: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    jobs: {
        createdAt: string;
        updatedAt: string;
        userName: string;
        srcImagePath: string;
        userId: string;
        params: Record<string, any>;
        type: string;
        status: string;
        id: string;
        thumbnailPath: string | null;
        tenantId: string;
        imageUrl: string;
        result: Record<string, any>;
        startedAt: string;
        finishedAt: string | null;
        durationMs: number | null;
        ip: string | null;
        ua: string | null;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
}, {
    jobs: {
        createdAt: string;
        updatedAt: string;
        userName: string;
        srcImagePath: string;
        userId: string;
        params: Record<string, any>;
        type: string;
        status: string;
        id: string;
        thumbnailPath: string | null;
        tenantId: string;
        imageUrl: string;
        result: Record<string, any>;
        startedAt: string;
        finishedAt: string | null;
        durationMs: number | null;
        ip: string | null;
        ua: string | null;
    }[];
    nextCursor: string | null;
    hasNextPage: boolean;
}>;
export declare const JobCreateRequestSchema: z.ZodObject<{
    type: z.ZodEnum<["EMBED", "DECODE"]>;
    srcImagePath: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    srcImagePath: string;
    type: "EMBED" | "DECODE";
    params?: Record<string, any> | undefined;
}, {
    srcImagePath: string;
    type: "EMBED" | "DECODE";
    params?: Record<string, any> | undefined;
}>;
export declare const JobCreateResponseSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    status: z.ZodString;
    tenantId: z.ZodString;
    userId: z.ZodString;
    userName: z.ZodString;
    srcImagePath: z.ZodString;
    imageUrl: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    userName: string;
    srcImagePath: string;
    userId: string;
    type: string;
    status: string;
    id: string;
    tenantId: string;
    imageUrl: string;
}, {
    createdAt: string;
    userName: string;
    srcImagePath: string;
    userId: string;
    type: string;
    status: string;
    id: string;
    tenantId: string;
    imageUrl: string;
}>;
export declare const LogsApiMeta: {
    getLogs: {
        method: "GET";
        path: string;
        query: z.ZodObject<{
            filter: z.ZodDefault<z.ZodEnum<["all", "embed", "decode"]>>;
            search: z.ZodOptional<z.ZodString>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            cursor: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            filter: "all" | "embed" | "decode";
            search?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cursor?: string | undefined;
        }, {
            limit?: number | undefined;
            search?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            filter?: "all" | "embed" | "decode" | undefined;
            cursor?: string | undefined;
        }>;
        responses: {
            200: z.ZodObject<{
                jobs: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    status: z.ZodString;
                    tenantId: z.ZodString;
                    userId: z.ZodString;
                    userName: z.ZodString;
                    srcImagePath: z.ZodString;
                    imageUrl: z.ZodString;
                    thumbnailPath: z.ZodNullable<z.ZodString>;
                    params: z.ZodRecord<z.ZodString, z.ZodAny>;
                    result: z.ZodRecord<z.ZodString, z.ZodAny>;
                    startedAt: z.ZodString;
                    finishedAt: z.ZodNullable<z.ZodString>;
                    durationMs: z.ZodNullable<z.ZodNumber>;
                    ip: z.ZodNullable<z.ZodString>;
                    ua: z.ZodNullable<z.ZodString>;
                    createdAt: z.ZodString;
                    updatedAt: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    updatedAt: string;
                    userName: string;
                    srcImagePath: string;
                    userId: string;
                    params: Record<string, any>;
                    type: string;
                    status: string;
                    id: string;
                    thumbnailPath: string | null;
                    tenantId: string;
                    imageUrl: string;
                    result: Record<string, any>;
                    startedAt: string;
                    finishedAt: string | null;
                    durationMs: number | null;
                    ip: string | null;
                    ua: string | null;
                }, {
                    createdAt: string;
                    updatedAt: string;
                    userName: string;
                    srcImagePath: string;
                    userId: string;
                    params: Record<string, any>;
                    type: string;
                    status: string;
                    id: string;
                    thumbnailPath: string | null;
                    tenantId: string;
                    imageUrl: string;
                    result: Record<string, any>;
                    startedAt: string;
                    finishedAt: string | null;
                    durationMs: number | null;
                    ip: string | null;
                    ua: string | null;
                }>, "many">;
                nextCursor: z.ZodNullable<z.ZodString>;
                hasNextPage: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                jobs: {
                    createdAt: string;
                    updatedAt: string;
                    userName: string;
                    srcImagePath: string;
                    userId: string;
                    params: Record<string, any>;
                    type: string;
                    status: string;
                    id: string;
                    thumbnailPath: string | null;
                    tenantId: string;
                    imageUrl: string;
                    result: Record<string, any>;
                    startedAt: string;
                    finishedAt: string | null;
                    durationMs: number | null;
                    ip: string | null;
                    ua: string | null;
                }[];
                nextCursor: string | null;
                hasNextPage: boolean;
            }, {
                jobs: {
                    createdAt: string;
                    updatedAt: string;
                    userName: string;
                    srcImagePath: string;
                    userId: string;
                    params: Record<string, any>;
                    type: string;
                    status: string;
                    id: string;
                    thumbnailPath: string | null;
                    tenantId: string;
                    imageUrl: string;
                    result: Record<string, any>;
                    startedAt: string;
                    finishedAt: string | null;
                    durationMs: number | null;
                    ip: string | null;
                    ua: string | null;
                }[];
                nextCursor: string | null;
                hasNextPage: boolean;
            }>;
        };
    };
    createJob: {
        method: "POST";
        path: string;
        body: z.ZodObject<{
            type: z.ZodEnum<["EMBED", "DECODE"]>;
            srcImagePath: z.ZodString;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            srcImagePath: string;
            type: "EMBED" | "DECODE";
            params?: Record<string, any> | undefined;
        }, {
            srcImagePath: string;
            type: "EMBED" | "DECODE";
            params?: Record<string, any> | undefined;
        }>;
        responses: {
            201: z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                status: z.ZodString;
                tenantId: z.ZodString;
                userId: z.ZodString;
                userName: z.ZodString;
                srcImagePath: z.ZodString;
                imageUrl: z.ZodString;
                createdAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                userName: string;
                srcImagePath: string;
                userId: string;
                type: string;
                status: string;
                id: string;
                tenantId: string;
                imageUrl: string;
            }, {
                createdAt: string;
                userName: string;
                srcImagePath: string;
                userId: string;
                type: string;
                status: string;
                id: string;
                tenantId: string;
                imageUrl: string;
            }>;
        };
    };
};
export type GetLogsQuery = z.infer<typeof GetLogsQuerySchema>;
export type LogItem = z.infer<typeof LogItemSchema>;
export type GetLogsResponse = z.infer<typeof GetLogsResponseSchema>;
export type JobCreateRequest = z.infer<typeof JobCreateRequestSchema>;
export type JobCreateResponse = z.infer<typeof JobCreateResponseSchema>;
