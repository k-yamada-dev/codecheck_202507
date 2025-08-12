import { useQuery } from '@tanstack/react-query';
import { fetchSignedUrl } from '@/lib/api/images';

/**
 * GCS署名付きURL取得用フック
 * @param path バケット内のオブジェクトパス
 */
export const useSignedUrl = (path: string | undefined) =>
  useQuery({
    queryKey: ['signedUrl', path],
    queryFn: () => fetchSignedUrl(path!),
    enabled: !!path,
    staleTime: 270 * 1000, // 5分有効のURLなら-30秒で再取得
  });
