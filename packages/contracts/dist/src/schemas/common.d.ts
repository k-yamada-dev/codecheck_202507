import { z } from 'zod';
export declare const ErrorResponseSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
    }, {
        code: string;
        message: string;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        code: string;
        message: string;
    };
}, {
    error: {
        code: string;
        message: string;
    };
}>;
export declare const PaginationQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    cursor?: string | undefined;
    limit?: number | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export declare const PaginationResponseSchema: z.ZodObject<{
    nextCursor: z.ZodNullable<z.ZodString>;
    hasNextPage: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    nextCursor: string | null;
    hasNextPage: boolean;
}, {
    nextCursor: string | null;
    hasNextPage: boolean;
}>;
export declare const DateRangeQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const SearchQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
}, {
    search?: string | undefined;
}>;
export declare const AuthHeaderSchema: z.ZodObject<{
    authorization: z.ZodString;
}, "strip", z.ZodTypeAny, {
    authorization: string;
}, {
    authorization: string;
}>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type AuthHeader = z.infer<typeof AuthHeaderSchema>;
