import { z } from 'zod';
import { JobTypeSchema } from '@/lib/zod/schemas/enums/JobType.schema';
import { JobStatusSchema } from '@/lib/zod/schemas/enums/JobStatus.schema';

// Request/Response schemas for Jobs API
export const CreateJobRequestSchema = z.object({
  type: JobTypeSchema,
  srcImagePath: z.string().min(1, 'Source image path is required'),
  thumbnailPath: z.string().optional().nullable(),
  params: z.record(z.string(), z.any()),
});

export const CreateJobResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  type: JobTypeSchema,
  status: JobStatusSchema,
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  durationMs: z.number().int().nullable(),
  thumbnailPath: z.string().nullable(),
  srcImagePath: z.string(),
  params: z.record(z.string(), z.any()),
  result: z.record(z.string(), z.any()),
  ip: z.string().nullable(),
  ua: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isArchived: z.boolean(),
  archivedAt: z.string().nullable(),
  imageUrl: z.string(),
  resultUrl: z.string().nullable(),
  watermark: z.string().nullable(),
  confidence: z.number().nullable(),
});

export const GetJobsQuerySchema = z.object({
  filter: z.enum(['all', 'embed', 'decode']).default('all').optional(),
  search: z.string().optional(),
  startDate: z.preprocess(
    arg => {
      if (!arg || typeof arg !== 'string' || arg === 'undefined' || arg === '') {
        return undefined;
      }
      return arg;
    },
    z.string().datetime({ message: 'Invalid datetime string! Must be UTC.' }).optional()
  ),
  endDate: z.preprocess(
    arg => {
      if (!arg || typeof arg !== 'string' || arg === 'undefined' || arg === '') {
        return undefined;
      }
      return arg;
    },
    z.string().datetime({ message: 'Invalid datetime string! Must be UTC.' }).optional()
  ),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  userId: z.string().uuid().optional(),
});

export const GetJobsResponseSchema = z.object({
  jobs: z.array(CreateJobResponseSchema),
  nextCursor: z.string().uuid().nullable(),
  hasNextPage: z.boolean(),
});

export const DeleteJobResponseSchema = z.object({ message: z.string() });

// API metadata for automatic generation
export const JobsApiMeta = {
  createJob: {
    method: 'POST' as const,
    path: '/jobs',
    summary: 'Create a new job',
    description: 'Creates a new watermark embedding or decoding job',
    requestSchema: CreateJobRequestSchema,
    responseSchema: CreateJobResponseSchema,
    statusCode: 201,
    tags: ['jobs'],
    auth: true,
  },
  getJobs: {
    method: 'GET' as const,
    path: '/jobs',
    summary: 'Get jobs list',
    description: 'Retrieves a paginated list of jobs with optional filtering',
    querySchema: GetJobsQuerySchema,
    responseSchema: GetJobsResponseSchema,
    statusCode: 200,
    tags: ['jobs'],
    auth: true,
  },
  deleteJob: {
    method: 'DELETE' as const,
    path: '/jobs/{id}',
    summary: 'Delete a job',
    description: 'Deletes a job by its ID',
    tags: ['jobs'],
    paramsSchema: z.object({ id: z.string().uuid() }),
    responseSchema: DeleteJobResponseSchema,
    statusCode: 200,
    auth: true,
  },
} as const;

export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;
export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>;
export type GetJobsQuery = z.infer<typeof GetJobsQuerySchema>;
export type GetJobsResponse = z.infer<typeof GetJobsResponseSchema>;
export type DeleteJobResponse = z.infer<typeof DeleteJobResponseSchema>;
