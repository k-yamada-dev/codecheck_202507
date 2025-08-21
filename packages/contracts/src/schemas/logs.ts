import { z } from 'zod';
import { JobTypeSchema, JobStatusSchema } from '../enums/job';

// Logs Query Schema
export const GetLogsQuerySchema = z.object({
  filter: z.enum(['all', 'embed', 'decode']).default('all'),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// Log Item Schema
export const LogItemSchema = z.object({
  id: z.string().uuid(),
  type: JobTypeSchema,
  status: JobStatusSchema,
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  srcImagePath: z.string(),
  imageUrl: z.string(),
  thumbnailPath: z.string().nullable(),
  params: z.record(z.string(), z.any()),
  result: z.record(z.string(), z.any()),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  durationMs: z.number().nullable(),
  ip: z.string().nullable(),
  ua: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Logs Response Schema
export const GetLogsResponseSchema = z.object({
  jobs: z.array(LogItemSchema),
  nextCursor: z.string().nullable(),
  hasNextPage: z.boolean(),
});

// Job Create Request Schema
export const JobCreateRequestSchema = z.object({
  type: JobTypeSchema,
  srcImagePath: z.string().min(1),
  params: z.record(z.string(), z.any()).optional(),
});

// Job Create Response Schema
export const JobCreateResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  status: z.string(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  srcImagePath: z.string(),
  imageUrl: z.string(),
  createdAt: z.string().datetime(),
});

// Logs API Meta
export const LogsApiMeta = {
  getLogs: {
    method: 'GET' as const,
    path: '/api/v1/logs',
    query: GetLogsQuerySchema,
    responses: {
      200: GetLogsResponseSchema,
    },
  },
  createJob: {
    method: 'POST' as const,
    path: '/api/v1/logs',
    body: JobCreateRequestSchema,
    responses: {
      201: JobCreateResponseSchema,
    },
  },
};

// Type exports
export type GetLogsQuery = z.infer<typeof GetLogsQuerySchema>;
export type LogItem = z.infer<typeof LogItemSchema>;
export type GetLogsResponse = z.infer<typeof GetLogsResponseSchema>;
export type JobCreateRequest = z.infer<typeof JobCreateRequestSchema>;
export type JobCreateResponse = z.infer<typeof JobCreateResponseSchema>;
