import { ZodError } from 'zod';

export enum ErrorCode {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EXPIRED_TOKEN = 'AUTH_EXPIRED_TOKEN',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // Validation Errors
  VALIDATION = 'VALIDATION',

  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',

  // Generic Errors
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public status = 400 // HTTP 用 (UI は無視して OK)
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

// 外部ライブラリ → AppError へ変換
export function normalizeError(e: unknown): AppError {
  // ① 既に AppError
  if (e instanceof AppError) return e;

  // ② Firebase Auth 例 (codeプロパティを持つオブジェクト)
  if (typeof e === 'object' && e && 'code' in e) {
    const firebaseCode = (e as { code: unknown }).code as string;
    if (firebaseCode === 'auth/invalid-credential') {
      return new AppError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'メールアドレスかパスワードが間違っています',
        401
      );
    }
  }

  // ③ ZodError 例
  if (e instanceof ZodError) {
    const message = e.issues.map((issue) => issue.message).join(', ');
    return new AppError(ErrorCode.VALIDATION, message, 422);
  }

  // ④ 通常のErrorインスタンス
  if (e instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN, e.message, 500);
  }

  return new AppError(ErrorCode.UNKNOWN, '予期しないエラーが発生しました', 500);
}
