'use server';

import { getStorage } from 'firebase-admin/storage';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

/**
 * GCS署名付きURLを生成
 * @param objectPath バケット内のオブジェクトパス
 * @param options.expiresInSec 有効期限（秒）
 * @returns 署名付きURL
 */
export async function getSignedUrl(
  objectPath: string,
  { expiresInSec = 300 }: { expiresInSec?: number } = {}
): Promise<string> {
  // バケット名を明示的に指定
  const bucketName =
    process.env.GCS_BUCKET_NAME || process.env.NEXT_PUBLIC_GCS_BUCKET_NAME;
  const bucket = getStorage(firebaseAdmin.app()).bucket(bucketName);
  const file = bucket.file(objectPath);

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInSec * 1000,
  });

  return url;
}
