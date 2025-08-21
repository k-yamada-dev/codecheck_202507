import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@acme/db';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { UserUpdateSchema } from '@acme/contracts';

interface RouteContext {
  params: {
    userId: string;
  };
}

export const GET = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const session = await getSessionInfo();
    const { userId } = context.params;

    const user = await prisma.user.findFirstOrThrow({
      where: { id: userId, tenantId: session.tenantId },
      include: { userRoles: true },
    });

    const userWithRoles = {
      ...user,
      roles: user.userRoles.map((ur) => ur.role),
    };

    return NextResponse.json(userWithRoles);
  }
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const session = await getSessionInfo();
    const { userId } = context.params;
    const body = await request.json();
    const { roles, ...userData } = UserUpdateSchema.parse(body);

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId, tenantId: session.tenantId },
        data: userData,
      });

      if (roles) {
        await tx.userRole.deleteMany({
          where: { userId: userId, tenantId: session.tenantId },
        });
        await tx.userRole.createMany({
          data: roles.map((role) => ({
            userId: userId,
            tenantId: session.tenantId,
            role: role,
          })),
        });
      }
      return user;
    });

    const userRoles = await prisma.userRole.findMany({ where: { userId } });
    const userWithRoles = {
      ...updatedUser,
      roles: userRoles.map((ur) => ur.role),
    };

    return NextResponse.json(userWithRoles);
  }
);

export const DELETE = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const session = await getSessionInfo();
    const { userId } = context.params;

    await prisma.$transaction(async (tx) => {
      // 関連するuserRolesを削除
      await tx.userRole.deleteMany({
        where: { userId: userId },
      });

      // ユーザーを削除
      await tx.user.delete({
        where: { id: userId, tenantId: session.tenantId },
      });
    });

    return new NextResponse(null, { status: 204 });
  }
);
