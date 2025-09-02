import { AppError, ErrorCode } from '@/lib/errors/core';

/**
 * APIから返されるエラーレスポンスの型定義
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * APIから返されるエラーかどうかを判定する型ガード
 */
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as { error: unknown }).error === 'object' &&
    (data as { error: unknown }).error !== null &&
    'code' in (data as { error: object }) &&
    'message' in (data as { error: object })
  );
}

/**
 * ファイルアップロード用のクライアントサイド関数
 *
 * @param file アップロードするファイル
 * @returns 成功した場合はレスポンスのJSONボディを返す
 * @throws {AppError} アップロードが失敗した場合
 */
export async function uploadFile<T>(file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    if (isApiErrorResponse(data)) {
      throw new AppError(
        data.error.code as ErrorCode,
        data.error.message,
        response.status
      );
    } else {
      throw new AppError(
        ErrorCode.UNKNOWN,
        data.message || 'File upload failed',
        response.status
      );
    }
  }

  return data as T;
}
