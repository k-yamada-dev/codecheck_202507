import { Prisma, BillingUsage } from '@prisma/client';
import { prisma } from '../client';

// Data required to create billing usage
export type CreateBillingUsageData = {
  tenantId: string;
  month: string; // e.g., "2025-08"
  uploads: number;
  apiCalls: number;
  storageGb: number;
  amount: number;
  isFinalized?: boolean;
  finalizedAt?: Date | null;
};

// Partial update type
export type UpdateBillingUsageData = Partial<{
  uploads: number;
  apiCalls: number;
  storageGb: number;
  amount: number;
  isFinalized: boolean;
  finalizedAt: Date | null;
}>;

export const billingUsageRepo = {
  create: (data: CreateBillingUsageData) => {
    return prisma.billingUsage.create({
      data,
    });
  },

  findById: (id: string): Promise<BillingUsage | null> => {
    return prisma.billingUsage.findUnique({ where: { id } });
  },

  // Find a billing usage row for a tenant and month
  findByTenantAndMonth: (tenantId: string, month: string): Promise<BillingUsage | null> => {
    return prisma.billingUsage.findFirst({
      where: { tenantId, month },
    });
  },

  // Upsert: useful for accumulating usage for a month
  upsertMonth: async ({
    tenantId,
    month,
    deltaUploads = 0,
    deltaApiCalls = 0,
    deltaStorageGb = 0,
    deltaAmount = 0,
  }: {
    tenantId: string;
    month: string;
    deltaUploads?: number;
    deltaApiCalls?: number;
    deltaStorageGb?: number;
    deltaAmount?: number;
  }): Promise<BillingUsage> => {
    const existing = await prisma.billingUsage.findFirst({ where: { tenantId, month } });
    if (existing) {
      return prisma.billingUsage.update({
        where: { id: existing.id },
        data: {
          uploads: { increment: deltaUploads },
          apiCalls: { increment: deltaApiCalls },
          storageGb: { increment: deltaStorageGb },
          amount: { increment: deltaAmount },
        } as Prisma.BillingUsageUpdateInput, // use explicit Prisma update input type for incremental ops
      });
    } else {
      return prisma.billingUsage.create({
        data: {
          tenantId,
          month,
          uploads: deltaUploads,
          apiCalls: deltaApiCalls,
          storageGb: deltaStorageGb,
          amount: deltaAmount,
          isFinalized: false,
        },
      });
    }
  },

  // List billing usages for a tenant with simple pagination
  findByTenant: async ({
    tenantId,
    cursor,
    limit = 50,
    filter,
  }: {
    tenantId: string;
    cursor?: string;
    limit?: number;
    filter?: { month?: string; isFinalized?: boolean };
  }): Promise<{ items: BillingUsage[]; nextCursor: string | null; hasNextPage: boolean }> => {
    const where: Prisma.BillingUsageWhereInput = { tenantId };
    if (filter?.month) where.month = filter.month;
    if (filter?.isFinalized !== undefined) where.isFinalized = filter.isFinalized;

    const args: Prisma.BillingUsageFindManyArgs = {
      where,
      orderBy: { month: 'desc' },
      take: limit + 1,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await prisma.billingUsage.findMany(args);
    const hasNextPage = items.length > limit;
    const page = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage ? page[page.length - 1].id : null;

    return { items: page, nextCursor, hasNextPage };
  },

  update: (id: string, data: UpdateBillingUsageData) => {
    return prisma.billingUsage.update({
      where: { id },
      data,
    });
  },

  delete: (id: string) => {
    return prisma.billingUsage.delete({
      where: { id },
    });
  },
};
