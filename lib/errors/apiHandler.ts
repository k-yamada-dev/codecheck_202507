import { NextRequest, NextResponse } from 'next/server';
import { normalizeError } from './core';

export function withErrorHandling<T extends { params?: unknown }>(
  fn: (req: NextRequest, ctx: T) => Promise<NextResponse>
) {
  console.error('withErrorHandling START');
  return async (req: NextRequest, ctx: T) => {
    console.error('HANDLER START', req.nextUrl.pathname);
    try {
      return await fn(req, ctx);
    } catch (e) {
      const err = normalizeError(e);

      // // 開発環境ではコンソールにエラーを出力
      // if (process.env.NODE_ENV !== 'production') {
      //   console.error(err);
      // }

      console.error(
        JSON.stringify({
          severity: 'ERROR', // Cloud Logging で色分け
          message: err.message,
          code: err.code,
          stack: err.stack, // 行番号つき
          path: req.nextUrl.pathname, // どの API か
        })
      );

      // API 用レスポンス
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.status }
      );
    }
  };
}
