// GET /api/logs/[id] - ログ詳細取得API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@acme/db';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;
    if (!id) {
      throw new AppError(ErrorCode.VALIDATION, 'Missing id', 400);
    }

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Log not found', 404);
    }

    // userNameを含めて返却
    return NextResponse.json({
      ...job,
      userName: job.userName,
    });
  }
);
