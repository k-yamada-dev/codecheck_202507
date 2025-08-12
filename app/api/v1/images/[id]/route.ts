import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { id } = params;

    const image = await prisma.job.findUnique({
      where: { id },
    });

    if (!image || image.tenantId !== session.user.tenantId) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Image not found', 404);
    }

    const updatedImage = await prisma.job.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    return NextResponse.json(updatedImage);
  }
);
