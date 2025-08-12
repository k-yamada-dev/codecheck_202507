import { Role } from '@prisma/client';

/**
 * Roles are defined in the Prisma schema.
 * This file re-exports them for use in the client-side application.
 */

// Re-export the enum directly
export { Role as USER_ROLES };

// For convenience, create a type alias
export type UserRole = Role;

// Create an array of all role values if needed elsewhere
export const ALL_ROLES: Role[] = Object.values(Role);
