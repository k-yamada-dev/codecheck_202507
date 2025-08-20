import path from 'path';

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
