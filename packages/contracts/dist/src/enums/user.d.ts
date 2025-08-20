import { z } from 'zod';
export declare const RoleSchema: z.ZodEnum<["UPLOADER", "DOWNLOADER", "AUDITOR", "TENANT_ADMIN", "INTERNAL_ADMIN"]>;
/**
 * Enum object for Role values.
 * @example
 * import { USER_ROLE } from '@acme/contracts';
 * if (role === USER_ROLE.UPLOADER) { ... }
 */
export declare const USER_ROLE: z.Values<["UPLOADER", "DOWNLOADER", "AUDITOR", "TENANT_ADMIN", "INTERNAL_ADMIN"]>;
export type UserRole = z.infer<typeof RoleSchema>;
