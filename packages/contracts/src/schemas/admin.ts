import { z } from 'zod';

// Tenant Schema
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tenantCode: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().nullable(),
});

// Get Tenants Response Schema
export const GetTenantsResponseSchema = z.object({
  tenants: z.array(TenantSchema),
  meta: z.any().optional(),
});

// Create Tenant Request Schema
export const CreateTenantRequestSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  adminEmail: z.string().email('Valid admin email is required'),
  tenantCode: z.string().optional(),
});

// Create Tenant Response Schema
export const CreateTenantResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tenantCode: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
});

// Admin API Meta
export const AdminApiMeta = {
  getTenants: {
    method: 'GET' as const,
    path: '/api/admin/tenants',
    responses: {
      200: GetTenantsResponseSchema,
    },
  },
  createTenant: {
    method: 'POST' as const,
    path: '/api/admin/tenants',
    body: CreateTenantRequestSchema,
    responses: {
      201: CreateTenantResponseSchema,
    },
  },
};

// Type exports
export type Tenant = z.infer<typeof TenantSchema>;
export type GetTenantsResponse = z.infer<typeof GetTenantsResponseSchema>;
export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
export type CreateTenantResponse = z.infer<typeof CreateTenantResponseSchema>;
