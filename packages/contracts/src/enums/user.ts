import { z } from 'zod';

// Role
export const RoleSchema = z.enum([
  'UPLOADER',
  'DOWNLOADER',
  'AUDITOR',
  'TENANT_ADMIN',
  'INTERNAL_ADMIN',
] as const);
/**
 * Enum object for Role values.
 * @example
 * import { USER_ROLE } from '@acme/contracts';
 * if (role === USER_ROLE.UPLOADER) { ... }
 */
export const USER_ROLE = RoleSchema.enum;
export type UserRole = z.infer<typeof RoleSchema>;
