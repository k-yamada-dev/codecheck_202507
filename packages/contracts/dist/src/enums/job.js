import { z } from 'zod';
// JobType
export const JobTypeSchema = z.enum(['EMBED', 'DECODE']);
/**
 * Enum object for JobType values.
 * @example
 * import { JOB_TYPE } from '@acme/contracts';
 * if (type === JOB_TYPE.EMBED) { ... }
 */
export const JOB_TYPE = JobTypeSchema.enum;
// JobStatus
export const JobStatusSchema = z.enum(['PENDING', 'RUNNING', 'DONE', 'ERROR']);
/**
 * Enum object for JobStatus values.
 * @example
 * import { JOB_STATUS } from '@acme/contracts';
 * if (status === JOB_STATUS.PENDING) { ... }
 */
export const JOB_STATUS = JobStatusSchema.enum;
