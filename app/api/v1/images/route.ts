import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { JobType, Prisma } from '@prisma/client';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';
import { GetImagesQuerySchema } from '@/app/api/_schemas/images';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) {
    throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);

  // Parse and validate query parameters using standardized schema
  const queryParams = GetImagesQuerySchema.parse({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    search: searchParams.get('search') || undefined,
    userId: searchParams.get('userId') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  });

  const { page, limit, sortBy, sortOrder, search, userId, startDate, endDate } = queryParams;
  const skip = (page - 1) * limit;

  const where: Prisma.JobWhereInput = {
    tenantId: session.user.tenantId,
    type: JobType.EMBED,
    isArchived: false,
  };

  // Add additional filters
  if (search) {
    where.OR = [{ userName: { contains: search } }, { srcImagePath: { contains: search } }];
  }

  if (userId) {
    where.userId = userId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [images, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      select: {
        id: true,
        srcImagePath: true,
        thumbnailPath: true,
        userName: true,
        createdAt: true,
        params: true, // to get original file name
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    data: images,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});
