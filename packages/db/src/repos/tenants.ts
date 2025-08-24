import { Prisma, Tenant } from '@prisma/client';
import { prisma } from '../client';

// Data needed to create a tenant
export type CreateTenantData = {
  name: string;
  tenantCode: string;
};

// Data for updating a tenant
export type UpdateTenantData = Partial<{
  name: string;
  tenantCode: string;
  isDeleted: boolean;
  deletedAt: Date | null;
}>;

export const tenantsRepo = {
  create: (data: CreateTenantData) => {
    return prisma.tenant.create({
      data,
    });
  },

  findById: (id: string): Promise<Tenant | null> => {
    return prisma.tenant.findUnique({ where: { id } });
  },

  findByTenantCode: (tenantCode: string): Promise<Tenant | null> => {
    return prisma.tenant.findUnique({ where: { tenant_code: tenantCode } as any });
  },

  update: (id: string, data: UpdateTenantData) => {
    return prisma.tenant.update({
      where: { id },
      data,
    });
  },

  delete: (id: string) => {
    return prisma.tenant.delete({
      where: { id },
    });
  },

  // Simple findMany with optional paging/filtering
  findMany: async ({
    cursor,
    limit = 50,
    filter,
  }: {
    cursor?: string;
    limit?: number;
    filter?: { name?: string; tenantCode?: string };
  }): Promise<{ tenants: Tenant[]; nextCursor: string | null; hasNextPage: boolean }> => {
    const where: Prisma.TenantWhereInput = {};
    if (filter?.name) where.name = { contains: filter.name };
    if (filter?.tenantCode) where.tenantCode = filter.tenantCode;

    const args: Prisma.TenantFindManyArgs = {
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await prisma.tenant.findMany(args);
    const hasNextPage = items.length > limit;
    const page = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage ? page[page.length - 1].id : null;

    return { tenants: page, nextCursor, hasNextPage };
  },
};
