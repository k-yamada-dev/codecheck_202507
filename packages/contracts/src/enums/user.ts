import { z } from 'zod';

// Role
export const RoleType = z.enum([
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
export const USER_ROLE = RoleType.enum;
export type RoleType = z.infer<typeof RoleType>;
