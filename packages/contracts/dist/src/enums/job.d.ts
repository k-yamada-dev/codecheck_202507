import { z } from 'zod';
export declare const JobTypeSchema: z.ZodEnum<["EMBED", "DECODE"]>;
/**
 * Enum object for JobType values.
 * @example
 * import { JOB_TYPE } from '@acme/contracts';
 * if (type === JOB_TYPE.EMBED) { ... }
 */
export declare const JOB_TYPE: z.Values<["EMBED", "DECODE"]>;
export type JobType = z.infer<typeof JobTypeSchema>;
export declare const JobStatusSchema: z.ZodEnum<["PENDING", "RUNNING", "DONE", "ERROR"]>;
/**
 * Enum object for JobStatus values.
 * @example
 * import { JOB_STATUS } from '@acme/contracts';
 * if (status === JOB_STATUS.PENDING) { ... }
 */
export declare const JOB_STATUS: z.Values<["PENDING", "RUNNING", "DONE", "ERROR"]>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
