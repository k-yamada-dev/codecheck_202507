import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

interface StorageConfig {
  projectId: string;
  bucket: string;
  keyFilename: string;
}

const storageConfig: StorageConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'acuasaas',
  bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'acuasaas-files',
  keyFilename: path.join(
    process.cwd(),
    process.env.GOOGLE_CLOUD_KEYFILE || 'config/secrets/acuasaas-credentials.json'
  ),
};

const storage = new Storage({
  projectId: storageConfig.projectId,
  keyFilename: storageConfig.keyFilename,
});

const bucket = storage.bucket(storageConfig.bucket);

export async function downloadFile(fileName: string): Promise<string> {
  if (!fileName) {
    throw new Error('fileName is undefined or invalid');
  }

  const localFilePath = path.join('/tmp', fileName);

  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp', { recursive: true });
  }

  await bucket.file(fileName).download({
    destination: localFilePath,
  });

  return localFilePath;
}

export async function uploadFile(file: string | Buffer, destination: string): Promise<string> {
  const gcsFile = bucket.file(destination);

  const stream = gcsFile.createWriteStream({
    resumable: false,
    public: true,
  });

  return new Promise((resolve, reject) => {
    stream.on('error', err => reject(err));
    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${storageConfig.bucket}/${destination}`);
    });

    if (Buffer.isBuffer(file)) {
      stream.end(file);
    } else {
      fs.createReadStream(file).pipe(stream);
    }
  });
}

export function getDestinationPath(
  tenantId: string,
  userId: string,
  jobId: string,
  type: 'original' | 'thumbnail' | 'processed',
  originalFileName: string
): string {
  const timestamp = Date.now();
  const extension = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, extension);

  let fileName: string;
  switch (type) {
    case 'thumbnail':
      fileName = `${baseName}_${timestamp}_thumb.jpg`;
      break;
    case 'processed':
      fileName = `${baseName}_${timestamp}_processed.jpg`;
      break;
    case 'original':
    default:
      fileName = `${baseName}_${timestamp}${extension}`;
      break;
  }

  return `${tenantId}/${type}/${userId}/${jobId}/${fileName}`;
}

export default storage;
