import { toast } from 'sonner';
import { normalizeError } from './core';
import { errorLogger } from '@/lib/utils/errorLogging';

export function handleUIError(e: unknown) {
  const err = normalizeError(e);

  // Dev コンソール
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // ユーザー向けトースト
  toast.error(err.message);

  // サーバーログへの送信
  errorLogger.logError(err);

  // 任意: Sentry など
  // Sentry.captureException(err);
}
