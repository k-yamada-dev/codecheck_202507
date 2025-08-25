import { Prisma, User } from '@prisma/client';
import { prisma } from '../client';
export type UserRow = User;

// ユーザーとその userRoles を含むペイロード型（prisma の include を反映）
export type UserWithRoles = Prisma.UserGetPayload<{ include: { userRoles: true } }>;

// Data needed to create a user
export type CreateUserData = {
  tenantId: string;
  provider: string;
  externalId: string;
  name: string;
  email: string;
  tenantCode?: string | null;
  userCode?: string | null;
};

// Data for updating a user
export type UpdateUserData = Partial<{
  name: string;
  email: string;
  tenantCode: string | null;
  userCode: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
}>;

export const usersRepo = {
  create: (data: CreateUserData) => {
    return prisma.user.create({
      data,
    });
  },

  findById: (id: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { id } });
  },

  // Find by tenantId + provider + externalId (matches Prisma @@unique)
  findByExternalId: (
    tenantId: string,
    provider: string,
    externalId: string
  ): Promise<User | null> => {
    return prisma.user.findFirst({
      where: { tenantId, provider, externalId },
    });
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
    filter?: { name?: string; email?: string };
  }): Promise<{ users: User[]; nextCursor: string | null; hasNextPage: boolean }> => {
    const where: Prisma.UserWhereInput = { tenantId };
    if (filter?.name) where.name = { contains: filter.name };
    if (filter?.email) where.email = { contains: filter.email };

    const args: Prisma.UserFindManyArgs = {
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await prisma.user.findMany(args);
    const hasNextPage = items.length > limit;
    const page = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage ? page[page.length - 1].id : null;

    return { users: page, nextCursor, hasNextPage };
  },

  update: (id: string, data: UpdateUserData) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete: (id: string) => {
    return prisma.user.delete({
      where: { id },
    });
  },
};
