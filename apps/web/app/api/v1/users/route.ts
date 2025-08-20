import { createNextRoute } from '@ts-rest/next';
import { contract } from '@acme/contracts';
import { prisma } from '@/lib/prisma';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { createGipUserAndDbUser } from '@/lib/userService';

const router = createNextRoute(contract.users, {
  getUsers: async ({ query }: { query: any }) => {
    try {
      const session = await getSessionInfo();
      const { page, limit, search } = query;

      const where: any = {
        tenantId: session.tenantId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { updatedAt: 'desc' },
          include: { userRoles: true },
        }),
        prisma.user.count({ where }),
      ]);

      const usersWithRoles = users.map((user: any) => ({
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        userRoles: user.userRoles.map((ur: any) => ({
          id: ur.id,
          role: ur.role,
          userId: ur.userId,
          createdAt: ur.createdAt.toISOString(),
          updatedAt: ur.updatedAt.toISOString(),
        })),
        roles: user.userRoles.map((ur: any) => ur.role),
      }));

      return {
        status: 200,
        body: {
          users: usersWithRoles,
          total,
        },
      };
    } catch (error) {
      console.error('Users API error:', error);
      return {
        status: 500,
        body: {
          users: [],
          total: 0,
        },
      };
    }
  },
  createUser: async ({ body }: { body: any }) => {
    try {
      const session = await getSessionInfo();
      const { roles, ...userData } = body;

      if (!roles || roles.length === 0) {
        return {
          status: 400,
          body: {
            id: '',
            tenantId: '',
            name: '',
            email: '',
            createdAt: '',
            updatedAt: '',
            userRoles: [],
            roles: [],
          },
        };
      }

      const newUserWithRoles = await prisma.$transaction(async (tx: any) => {
        const user = await createGipUserAndDbUser({
          prisma: tx,
          tenantId: session.tenantId,
          email: userData.email,
          name: userData.name,
          roles: roles,
        });
        return user;
      });

      const responseData = {
        id: newUserWithRoles.id,
        tenantId: newUserWithRoles.tenantId,
        name: newUserWithRoles.name,
        email: newUserWithRoles.email,
        createdAt: newUserWithRoles.createdAt.toISOString(),
        updatedAt: newUserWithRoles.updatedAt.toISOString(),
        userRoles: newUserWithRoles.userRoles.map((ur: any) => ({
          id: ur.id,
          role: ur.role,
          userId: ur.userId,
          createdAt: ur.createdAt.toISOString(),
          updatedAt: ur.updatedAt.toISOString(),
        })),
        roles: newUserWithRoles.userRoles.map((ur: any) => ur.role),
      };

      return {
        status: 201,
        body: responseData,
      };
    } catch (error) {
      console.error('Create User API error:', error);
      return {
        status: 500,
        body: {
          id: '',
          tenantId: '',
          name: '',
          email: '',
          createdAt: '',
          updatedAt: '',
          userRoles: [],
          roles: [],
        },
      };
    }
  },
});

export const GET = router.getUsers;
export const POST = router.createUser;
