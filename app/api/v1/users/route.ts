import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { UserCreateSchema, UserListQuerySchema } from '@/app/api/_schemas/users';
import { Prisma } from '@prisma/client';
import { createGipUserAndDbUser } from '@/lib/userService';
import { AppError, ErrorCode } from '@/lib/errors/core';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await getSessionInfo();
  const { searchParams } = new URL(request.url);
  const query = UserListQuerySchema.parse(Object.fromEntries(searchParams));

  const where: Prisma.UserWhereInput = {
    tenantId: session.tenantId,
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      orderBy: { updatedAt: 'desc' },
      include: { userRoles: true },
    }),
    prisma.user.count({ where }),
  ]);

  const usersWithRoles = users.map(user => ({
    ...user,
    roles: user.userRoles.map(ur => ur.role),
  }));

  return NextResponse.json({ users: usersWithRoles, total });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await getSessionInfo();
  const body = await request.json();
  const { roles, ...userData } = UserCreateSchema.parse(body);

  if (!roles || roles.length === 0) {
    throw new AppError(ErrorCode.VALIDATION, '少なくとも1つのロールを指定する必要があります', 400);
  }

  const newUserWithRoles = await prisma.$transaction(async tx => {
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
    ...newUserWithRoles,
    roles: newUserWithRoles.userRoles.map(ur => ur.role),
  };

  return NextResponse.json(responseData, { status: 201 });
});
