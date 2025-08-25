import { z } from 'zod';

// User List Query Schema
export const UserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

// User Role Schema
export const UserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.string(),
  assignedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userRoles: z.array(UserRoleSchema),
  roles: z.array(z.string()),
});

// User List Response Schema
export const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().int().nonnegative(),
});

// User Create Request Schema
export const UserCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

// User Create Response Schema
export const UserCreateResponseSchema = UserSchema;

// User Update Request Schema
export const UserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

// User Update Response Schema
export const UserUpdateResponseSchema = UserSchema;

// Users API Meta
export const UsersApiMeta = {
  getUsers: {
    method: 'GET' as const,
    path: '/api/v1/users',
    query: UserListQuerySchema,
    responses: {
      200: UserListResponseSchema,
    },
  },
  createUser: {
    method: 'POST' as const,
    path: '/api/v1/users',
    body: UserCreateSchema,
    responses: {
      201: UserCreateResponseSchema,
    },
  },
};

// Type exports
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserCreateRequest = z.infer<typeof UserCreateSchema>;
export type UserCreateResponse = z.infer<typeof UserCreateResponseSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>;
export type UserUpdateResponse = z.infer<typeof UserUpdateResponseSchema>;
