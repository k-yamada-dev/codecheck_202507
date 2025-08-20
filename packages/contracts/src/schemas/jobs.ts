import { z } from 'zod';
import { JobTypeSchema, JobStatusSchema } from '../enums/job';

// Request/Response schemas for Jobs API

/**
 * @description DTO for creating a new job.
 * `srcImagePath` is required, and other parameters can be passed in `payload`.
 */
export const CreateJobRequestSchema = z.object({
  type: JobTypeSchema,
  srcImagePath: z.string({ required_error: 'Source image path is required.' }).min(1),
  payload: z.record(z.unknown()).default({}),
});

/**
 * @description DTO for the simple job resource returned after creation.
 */
export const JobResponseSchema = z.object({
  id: z.string().uuid(),
  type: JobTypeSchema,
  status: JobStatusSchema,
  createdAt: z.string(), // Date is returned as an ISO string
});

/**
 * @description DTO for a job item in a list, containing more details for UI.
 */
export const JobListItemSchema = JobResponseSchema.extend({
  srcImagePath: z.string().nullable(),
  thumbnailPath: z.string().nullable(),
  params: z.record(z.unknown()).nullable(),
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
  jobs: z.array(JobListItemSchema), // Use the new detailed DTO for lists
  nextCursor: z.string().uuid().nullable(),
  hasNextPage: z.boolean(),
});

export const DeleteJobResponseSchema = z.object({ message: z.string() });

// API metadata for @ts-rest contract
export const JobsApiMeta = {
  createJob: {
    method: 'POST' as const,
    path: '/api/v1/jobs',
    summary: 'Create a new job',
    description: 'Creates a new watermark embedding or decoding job',
    body: CreateJobRequestSchema,
    responses: {
      201: JobResponseSchema,
    },
    tags: ['jobs'],
  },
  getJobs: {
    method: 'GET' as const,
    path: '/api/v1/jobs',
    summary: 'Get jobs list',
    description: 'Retrieves a paginated list of jobs with optional filtering',
    query: GetJobsQuerySchema,
    responses: {
      200: GetJobsResponseSchema,
    },
    tags: ['jobs'],
  },
  deleteJob: {
    method: 'DELETE' as const,
    path: '/api/v1/jobs/:id',
    summary: 'Delete a job',
    description: 'Deletes a job by its ID',
    pathParams: z.object({ id: z.string().uuid() }),
    body: z.object({}), // DELETE has empty body
    responses: {
      200: DeleteJobResponseSchema,
    },
    tags: ['jobs'],
  },
} as const;

// Export types for convenience
export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;
export type JobResponse = z.infer<typeof JobResponseSchema>;
export type JobListItem = z.infer<typeof JobListItemSchema>;
export type GetJobsQuery = z.infer<typeof GetJobsQuerySchema>;
export type GetJobsResponse = z.infer<typeof GetJobsResponseSchema>;
export type DeleteJobResponse = z.infer<typeof DeleteJobResponseSchema>;
