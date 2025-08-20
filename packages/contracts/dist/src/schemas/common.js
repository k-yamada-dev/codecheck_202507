import { z } from 'zod';
// Common error response schema
export const ErrorResponseSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
});
// Common pagination schema
export const PaginationQuerySchema = z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
});
export const PaginationResponseSchema = z.object({
    nextCursor: z.string().uuid().nullable(),
    hasNextPage: z.boolean(),
});
// Common filter schemas
export const DateRangeQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
export const SearchQuerySchema = z.object({
    search: z.string().optional(),
});
// Auth header schema
export const AuthHeaderSchema = z.object({
    authorization: z.string().regex(/^Bearer .+/, 'Invalid authorization format'),
});
