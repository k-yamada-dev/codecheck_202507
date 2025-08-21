import { USER_ROLE, type RoleType } from '@acme/contracts';

/**
 * Roles are defined in the contracts package.
 * This file re-exports them for use in the client-side application.
*/

// Re-export the enum directly
export { USER_ROLE };

// For convenience, create a type alias
export type UserRole = RoleType;

// Create an array of all role values if needed elsewhere
export const ALL_ROLES = Object.values(USER_ROLE) as [RoleType, ...RoleType[]];
