import { Prisma, Log } from '@prisma/client';
import { prisma } from '../client';

// Data needed to create a log entry
export type CreateLogData = {
  tenantId: string;
  jobId: string;
  action: string;
  userId: string;
  details?: Prisma.JsonObject | null;
};

// Data for updating a log entry (partial)
export type UpdateLogData = Partial<{
  action: string;
  details: Prisma.JsonObject | null;
  isDeleted: boolean;
  deletedAt: Date | null;
}>;

export const logsRepo = {
  create: (data: CreateLogData) => {
    return prisma.log.create({
      data: {
        ...data,
        // Prisma's generated types for Json fields are sometimes strict;
        // cast here to satisfy the expected InputJsonValue / Nullable types.
        details: data.details as any,
      },
    });
  },

  findById: (id: string): Promise<Log | null> => {
    return prisma.log.findUnique({ where: { id } });
  },

  findByJobId: async ({
    jobId,
    cursor,
    limit = 50,
  }: {
    jobId: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ logs: Log[]; nextCursor: string | null; hasNextPage: boolean }> => {
    const args: Prisma.LogFindManyArgs = {
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await prisma.log.findMany(args);
    const hasNextPage = items.length > limit;
    const page = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage ? page[page.length - 1].id : null;

    return { logs: page, nextCursor, hasNextPage };
  },

  findByTenant: async ({
    tenantId,
    cursor,
    limit = 50,
    filter,
  }: {
    tenantId: string;
    cursor?: string;
    limit?: number;
    filter?: { action?: string; userId?: string };
  }): Promise<{ logs: Log[]; nextCursor: string | null; hasNextPage: boolean }> => {
    const where: Prisma.LogWhereInput = { tenantId };
    if (filter?.action) where.action = { contains: filter.action };
    if (filter?.userId) where.userId = filter.userId;

    const args: Prisma.LogFindManyArgs = {
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await prisma.log.findMany(args);
    const hasNextPage = items.length > limit;
    const page = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage ? page[page.length - 1].id : null;

    return { logs: page, nextCursor, hasNextPage };
  },

  update: (id: string, data: UpdateLogData) => {
    return prisma.log.update({
      where: { id },
      data: {
        ...data,
        details: (data as any).details as any,
      },
    });
  },

  delete: (id: string) => {
    return prisma.log.delete({
      where: { id },
    });
  },
};
