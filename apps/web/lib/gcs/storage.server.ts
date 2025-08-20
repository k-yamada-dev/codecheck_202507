import { Storage, StorageOptions } from '@google-cloud/storage';
import { env } from '@/lib/env.server';
import path from 'path';
import fs from 'fs';

/* ────────────────────────────
   認証オプションを環境変数の有無で切替
   - Cloud Run 本番       : 何も指定しない → ADC が SA を自動使用
   - ローカル/CI (鍵ファイル) : GOOGLE_CLOUD_KEYFILE でパスを渡す
   - ローカル/CI (文字列)    : GOOGLE_CLOUD_KEY_JSON に JSON を渡す
──────────────────────────── */
const opts: StorageOptions = {};

if (process.env.GOOGLE_CLOUD_KEYFILE) {
  // 相対パスでも絶対パスでも OK
  opts.keyFilename = path.isAbsolute(process.env.GOOGLE_CLOUD_KEYFILE)
    ? process.env.GOOGLE_CLOUD_KEYFILE
    : path.join(process.cwd(), process.env.GOOGLE_CLOUD_KEYFILE);
} else if (process.env.GOOGLE_CLOUD_KEY_JSON) {
  opts.credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);
}

if (process.env.GOOGLE_CLOUD_PROJECT) {
  opts.projectId = process.env.GOOGLE_CLOUD_PROJECT;
}

const storage = new Storage(opts);
const bucket = storage.bucket(env.GCS_BUCKET_NAME);

/**
 * Generates a signed URL for a file in GCS.
 * @param filePath The path to the file in the bucket.
 * @param ttl The time to live for the URL in seconds.
 * @returns The signed URL.
 */
export async function getSignedUrl(filePath: string, ttl = Number(env.GCS_SIGNED_URL_TTL)) {
  const [url] = await bucket.file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + ttl * 1000,
  });
  return url;
}

/* ────────────────────────────
   GCS → /tmp へダウンロード
──────────────────────────── */
export async function downloadFile(fileName: string): Promise<string> {
  if (!fileName) throw new Error('fileName is undefined or invalid');

  const localFilePath = path.join('/tmp', fileName);
  fs.mkdirSync('/tmp', { recursive: true }); // /tmp が無くても OK

  await bucket.file(fileName).download({ destination: localFilePath });
  return localFilePath;
}

/* ────────────────────────────
   ローカルファイル or Buffer を GCS へアップロード
──────────────────────────── */
export async function uploadFile(file: string | Buffer, destination: string): Promise<string> {
  const gcsFile = bucket.file(destination);
  const stream = gcsFile.createWriteStream({ resumable: false, public: true });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', () => resolve(destination));

    Buffer.isBuffer(file) ? stream.end(file) : fs.createReadStream(file).pipe(stream);
  });
}
