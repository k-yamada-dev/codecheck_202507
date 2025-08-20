import { z } from 'zod';
// User List Query Schema
export const UserListQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
});
// User Role Schema
export const UserRoleSchema = z.object({
    id: z.string().uuid(),
    role: z.string(),
    userId: z.string().uuid(),
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
// Users API Meta
export const UsersApiMeta = {
    getUsers: {
        method: 'GET',
        path: '/api/v1/users',
        query: UserListQuerySchema,
        responses: {
            200: UserListResponseSchema,
        },
    },
    createUser: {
        method: 'POST',
        path: '/api/v1/users',
        body: UserCreateSchema,
        responses: {
            201: UserCreateResponseSchema,
        },
    },
};
