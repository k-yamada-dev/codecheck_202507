import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { promises as fs } from 'fs';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { uploadFile } from '@/lib/gcs/storage.server';
import { getDestinationPath } from '@/lib/utils/path';
import { createThumbnail } from '@/lib/utils/imageProcessing';
import { withErrorHandling } from '@/lib/errors/apiHandler';
import { AppError, ErrorCode } from '@/lib/errors/core';
import { env } from '@/lib/env.server';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TMP_DIR = '/tmp/uploads';

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.error('upload handler START');
  const contentType = request.headers.get('content-type');

  if (!contentType || !contentType.includes('multipart/form-data')) {
    console.error('[UPLOAD_API] Invalid Content-Type:', contentType);
    throw new AppError(
      ErrorCode.VALIDATION,
      'Invalid Content-Type. Expected multipart/form-data',
      400
    );
  }

  const { tenantId, userId } = await getSessionInfo();
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new AppError(ErrorCode.VALIDATION, 'No file provided', 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      ErrorCode.VALIDATION,
      `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      400
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new AppError(
      ErrorCode.VALIDATION,
      'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      400
    );
  }

  await fs.mkdir(TMP_DIR, { recursive: true });

  const tempFilePath = path.join(TMP_DIR, `${uuidv4()}-${file.name}`);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempFilePath, fileBuffer);

  const jobId = uuidv4();

  const tempThumbnailPath = path.join(
    TMP_DIR,
    `thumb-${path.basename(tempFilePath)}.jpg`
  );
  await createThumbnail(tempFilePath, tempThumbnailPath);

  const originalDestPath = getDestinationPath(
    tenantId,
    userId,
    jobId,
    'original',
    file.name
  );
  const thumbnailDestPath = getDestinationPath(
    tenantId,
    userId,
    jobId,
    'thumbnail',
    file.name
  );

  const [originalFilePath, thumbnailPath] = await Promise.all([
    uploadFile(tempFilePath, originalDestPath),
    uploadFile(tempThumbnailPath, thumbnailDestPath),
  ]);

  await fs.unlink(tempFilePath);
  await fs.unlink(tempThumbnailPath);

  // IMAGE_BASE_URL が設定されていればそれを使い、なければ storage.googleapis.com を組み立てる
  const baseUrl =
    env.IMAGE_BASE_URL ??
    `https://storage.googleapis.com/${env.GCS_BUCKET_NAME}`;

  const fileUrl = `${baseUrl}/${originalFilePath}`;
  const thumbnailUrl = thumbnailPath ? `${baseUrl}/${thumbnailPath}` : null;

  return NextResponse.json({
    jobId,
    filePath: fileUrl,
    thumbnailPath: thumbnailUrl,
  });
});
