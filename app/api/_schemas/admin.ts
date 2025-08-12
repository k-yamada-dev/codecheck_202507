import { z } from 'zod';

export const TenantItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantCode: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable(),
});

// UserRole Item Schema
export const UserRoleItemSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: z.string(),
  assignedAt: z.string().datetime(),
  isDeleted: z.boolean(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// BillingUsage Item Schema
export const BillingUsageItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  month: z.string(),
  uploads: z.number().int(),
  apiCalls: z.number().int(),
  storageGb: z.number(),
  amount: z.number(),
  isFinalized: z.boolean(),
  finalizedAt: z.string().datetime().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Log Item Schema
export const LogItemSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  jobId: z.string().uuid(),
  action: z.string(),
  userId: z.string().uuid(),
  details: z.any().optional(),
  isDeleted: z.boolean(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Get Tenants Response Schema
export const GetTenantsResponseSchema = z.object({
  tenants: z.array(TenantItemSchema),
  meta: z
    .object({
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
    })
    .optional(),
});

// Create Tenant Request Schema
export const CreateTenantRequestSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  adminEmail: z.string().email('Valid admin email is required'),
  tenantCode: z.string().optional(), // Auto-generated if not provided
});

// Create Tenant Response Schema
export const CreateTenantResponseSchema = z.object({
  tenant: TenantItemSchema,
  adminUser: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
  }),
});

// Update Tenant Request Schema
export const UpdateTenantRequestSchema = z.object({
  name: z.string().min(1).optional(),
  tenantCode: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

// Delete Tenant Request Schema
export const DeleteTenantRequestSchema = z.object({
  force: z.boolean().default(false), // Soft delete by default
});

export const DeleteTenantResponseSchema = z.object({ message: z.string() });

// Tenant Stats Schema
export const TenantStatsSchema = z.object({
  userCount: z.number().int().nonnegative(),
  jobCount: z.number().int().nonnegative(),
  storageUsed: z.number().nonnegative(), // in bytes
  lastActivity: z.string().datetime().nullable(),
});

// Get Tenant Stats Response Schema
export const GetTenantStatsResponseSchema = z.object({
  tenantId: z.string().uuid(),
  stats: TenantStatsSchema,
});

// API Meta information
export const AdminApiMeta = {
  getTenants: {
    method: 'GET' as const,
    path: '/admin/tenants',
    summary: 'Get tenants list',
    description: 'Retrieves a list of all tenants (admin only)',
    tags: ['admin', 'tenants'],
    responseSchema: GetTenantsResponseSchema,
    statusCode: 200,
    requiresRole: 'INTERNAL_ADMIN' as const,
  },
  createTenant: {
    method: 'POST' as const,
    path: '/admin/tenants',
    summary: 'Create tenant',
    description: 'Creates a new tenant with admin user (admin only)',
    tags: ['admin', 'tenants'],
    requestSchema: CreateTenantRequestSchema,
    responseSchema: CreateTenantResponseSchema,
    statusCode: 201,
    requiresRole: 'INTERNAL_ADMIN' as const,
  },
  updateTenant: {
    method: 'PUT' as const,
    path: '/admin/tenants/{id}',
    summary: 'Update tenant',
    description: 'Updates tenant information (admin only)',
    tags: ['admin', 'tenants'],
    requestSchema: UpdateTenantRequestSchema,
    responseSchema: TenantItemSchema,
    statusCode: 200,
    requiresRole: 'INTERNAL_ADMIN' as const,
  },
  deleteTenant: {
    method: 'DELETE' as const,
    path: '/admin/tenants/{id}',
    summary: 'Delete tenant',
    description: 'Deletes a tenant (soft delete by default, admin only)',
    tags: ['admin', 'tenants'],
    requestSchema: DeleteTenantRequestSchema,
    responseSchema: DeleteTenantResponseSchema,
    statusCode: 200,
    requiresRole: 'INTERNAL_ADMIN' as const,
  },
  getTenantStats: {
    method: 'GET' as const,
    path: '/admin/tenants/{id}/stats',
    summary: 'Get tenant statistics',
    description: 'Retrieves usage statistics for a tenant (admin only)',
    tags: ['admin', 'tenants', 'stats'],
    responseSchema: GetTenantStatsResponseSchema,
    statusCode: 200,
    requiresRole: 'INTERNAL_ADMIN' as const,
  },
} as const;

// Type exports
export type TenantItem = z.infer<typeof TenantItemSchema>;
export type GetTenantsResponse = z.infer<typeof GetTenantsResponseSchema>;
export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
export type CreateTenantResponse = z.infer<typeof CreateTenantResponseSchema>;
export type UpdateTenantRequest = z.infer<typeof UpdateTenantRequestSchema>;
export type DeleteTenantRequest = z.infer<typeof DeleteTenantRequestSchema>;
export type DeleteTenantResponse = z.infer<typeof DeleteTenantResponseSchema>;
export type TenantStats = z.infer<typeof TenantStatsSchema>;
export type GetTenantStatsResponse = z.infer<typeof GetTenantStatsResponseSchema>;
