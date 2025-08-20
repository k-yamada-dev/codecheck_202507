import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetMail } from '@/lib/userService';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    throw new AppError(ErrorCode.VALIDATION, 'メールアドレスが不正です', 400);
  }
  await sendPasswordResetMail(email);
  return NextResponse.json({ ok: true });
});
