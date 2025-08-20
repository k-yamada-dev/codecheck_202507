import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';

/**
 * テナント情報を更新するAPI
 * @param req Request
 * @param params PatchParams
 * @returns NextResponse
 */
export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await getServerSession(authOptions);
    const { id: tenantId } = await params;

    if (session?.user?.role !== Role.INTERNAL_ADMIN) {
      throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Forbidden', 403);
    }

    const { name } = await req.json();

    if (!name) {
      throw new AppError(ErrorCode.VALIDATION, 'Missing name', 400);
    }

    const updatedTenant = await prisma.tenant.update({
      where: {
        id: tenantId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedTenant);
  }
);

/**
 * テナントを論理削除するAPI
 * @param req Request
 * @param params DeleteParams
 * @returns NextResponse
 */
export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await getServerSession(authOptions);
    const { id: tenantId } = await params;

    if (session?.user?.role !== Role.INTERNAL_ADMIN) {
      throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Forbidden', 403);
    }

    await prisma.tenant.update({
      where: {
        id: tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  }
);
