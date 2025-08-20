import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSignedUrl } from '@/lib/gcs/getSignedUrl';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';

// GET /api/v1/images/signed-url?path=<bucket>/<object>
export const GET = withErrorHandling(async (req: NextRequest) => {
  const schema = z.object({ path: z.string().min(1) });
  const { searchParams } = new URL(req.url);
  const parsed = schema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    throw parsed.error;
  }

  const { path } = parsed.data;

  // 認可チェック（例: ログイン済みのみ許可）
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AppError(ErrorCode.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
  }

  const url = await getSignedUrl(path, { expiresInSec: 300 });
  return NextResponse.json({ url });
});
