import { createApiClient } from '@acme/api-client';

// APIクライアントのインスタンスを作成
export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
});

// TanStack Queryで使用するためのヘルパー関数
export const createQueryKey = (
  endpoint: string,
  params?: Record<string, unknown>
) => {
  return params ? [endpoint, params] : [endpoint];
};
