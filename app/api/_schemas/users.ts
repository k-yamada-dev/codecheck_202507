import { z } from 'zod';
import { ALL_ROLES } from '@/lib/types/role';

// Note: CUID (e.g., user.id, tenant.id) is validated as a string,
// as specific CUID format validation is typically handled by the database layer.

// Base schema for user properties
const UserBaseSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
});

// Schema for creating a new user
export const UserCreateSchema = UserBaseSchema.extend({
  // When creating, roles are optional. Default roles can be assigned server-side.
  roles: z.array(z.enum(ALL_ROLES)).optional(),
});

// Schema for updating an existing user
export const UserUpdateSchema = UserBaseSchema.extend({
  // When updating, roles can be an empty array.
  roles: z.array(z.enum(ALL_ROLES)),
}).partial(); // Allow partial updates

// Schema for a single user response
export const UserResponseSchema = UserBaseSchema.extend({
  id: z.string(),
  tenantId: z.string(),
  provider: z.string(),
  externalId: z.string().nullable(),
  roles: z.array(z.enum(ALL_ROLES)),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for a list of users response
export const UserListResponseSchema = z.object({
  users: z.array(UserResponseSchema),
  total: z.number(),
});

// Schema for API route parameters (e.g., /api/users/{userId})
export const UserPathParamsSchema = z.object({
  userId: z.string(),
});

// Schema for API query parameters (e.g., /api/users?tenantId=...&search=...)
export const UserListQuerySchema = z.object({
  tenantId: z.string(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});

// Export types for convenience
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserPathParams = z.infer<typeof UserPathParamsSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;

// Metadata for API generation
export const UsersApiMeta = {
  getUsers: {
    method: 'GET',
    path: '/users',
    summary: 'Get user list',
    description: 'Retrieves a paginated list of users for a tenant.',
    tags: ['users'],
    querySchema: 'UserListQuerySchema',
    responseSchema: 'UserListResponseSchema',
    auth: true,
  },
  getUser: {
    method: 'GET',
    path: '/users/{userId}',
    summary: 'Get user details',
    description: 'Retrieves details for a specific user.',
    tags: ['users'],
    pathParamsSchema: 'UserPathParamsSchema',
    responseSchema: 'UserResponseSchema',
    auth: true,
  },
  createUser: {
    method: 'POST',
    path: '/users',
    summary: 'Create a new user',
    description: 'Creates a new user within the current tenant.',
    tags: ['users'],
    requestSchema: 'UserCreateSchema',
    responseSchema: 'UserResponseSchema',
    auth: true,
  },
  updateUser: {
    method: 'PATCH',
    path: '/users/{userId}',
    summary: 'Update a user',
    description: "Updates an existing user's information.",
    tags: ['users'],
    pathParamsSchema: 'UserPathParamsSchema',
    requestSchema: 'UserUpdateSchema',
    responseSchema: 'UserResponseSchema',
    auth: true,
  },
  deleteUser: {
    method: 'DELETE',
    path: '/users/{userId}',
    summary: 'Delete a user',
    description: 'Deletes a user from the tenant.',
    tags: ['users'],
    pathParamsSchema: 'UserPathParamsSchema',
    auth: true,
  },
} as const;
