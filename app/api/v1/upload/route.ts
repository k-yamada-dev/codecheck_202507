import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { promises as fs } from 'fs';
import { getSessionInfo } from '@/app/utils/apiAuth';
import { uploadFile, getDestinationPath } from '@/app/config/storage';
import { createThumbnail } from '@/app/utils/imageProcessing';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TMP_DIR = '/tmp/uploads';

export async function POST(request: NextRequest) {
  try {
    console.log('[UPLOAD_API] Request headers:', Object.fromEntries(request.headers.entries()));
    const contentType = request.headers.get('content-type');
    console.log('[UPLOAD_API] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('[UPLOAD_API] Invalid Content-Type:', contentType);
      return NextResponse.json({ error: 'Invalid Content-Type. Expected multipart/form-data' }, { status: 400 });
    }

    const { tenantId, userId } = await getSessionInfo();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    await fs.mkdir(TMP_DIR, { recursive: true });

    const tempFilePath = path.join(TMP_DIR, `${uuidv4()}-${file.name}`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    const jobId = uuidv4();

    const tempThumbnailPath = path.join(TMP_DIR, `thumb-${path.basename(tempFilePath)}.jpg`);
    await createThumbnail(tempFilePath, tempThumbnailPath);

    const originalDestPath = getDestinationPath(tenantId, userId, jobId, 'original', file.name);
    const thumbnailDestPath = getDestinationPath(tenantId, userId, jobId, 'thumbnail', file.name);

    const [originalFileUrl, thumbnailUrl] = await Promise.all([
      uploadFile(tempFilePath, originalDestPath),
      uploadFile(tempThumbnailPath, thumbnailDestPath),
    ]);

    await fs.unlink(tempFilePath);
    await fs.unlink(tempThumbnailPath);

    return NextResponse.json({
      jobId,
      filePath: originalFileUrl,
      thumbnailPath: thumbnailUrl,
    });

  } catch (error: unknown) {
    console.error('Error in file upload:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `File upload failed: ${message}` }, { status: 500 });
  }
}
