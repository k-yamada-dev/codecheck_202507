import { z } from 'zod';

// Images Query Schema - 既存実装を標準化
export const GetImagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'userName', 'srcImagePath']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Image Item Schema
export const ImageItemSchema = z.object({
  id: z.string().uuid(),
  srcImagePath: z.string(),
  thumbnailPath: z.string().nullable(),
  userName: z.string(),
  isDeleted: z.boolean(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  params: z.record(z.string(), z.any()),
});

// Images Response Schema
export const GetImagesResponseSchema = z.object({
  data: z.array(ImageItemSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
});

// Upload Image Request Schema
export const UploadImageRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  folder: z.enum(['images', 'thumbnails', 'results']).default('images'),
});

// Upload Image Response Schema
export const UploadImageResponseSchema = z.object({
  uploadUrl: z.string().url(),
  downloadUrl: z.string().url().optional(),
  filePath: z.string(),
  expiresIn: z.number().int().positive(),
});

// API Meta information
export const ImagesApiMeta = {
  getImages: {
    method: 'GET' as const,
    path: '/images',
    summary: 'Get images list',
    description: 'Retrieves a paginated list of images with optional filtering and sorting',
    tags: ['images'],
    querySchema: GetImagesQuerySchema,
    responseSchema: GetImagesResponseSchema,
    statusCode: 200,
  },
  uploadImage: {
    method: 'POST' as const,
    path: '/images/upload',
    summary: 'Upload image',
    description: 'Generates signed URL for image upload to cloud storage',
    tags: ['images'],
    requestSchema: UploadImageRequestSchema,
    responseSchema: UploadImageResponseSchema,
    statusCode: 200,
  },
  archiveImage: {
    method: 'PATCH' as const,
    path: '/images/{id}',
    summary: 'Archive an image',
    description: 'Marks an image as archived (soft delete)',
    tags: ['images'],
    paramsSchema: z.object({ id: z.string().uuid() }),
    responseSchema: ImageItemSchema,
    statusCode: 200,
  },
} as const;

// Type exports
export type GetImagesQuery = z.infer<typeof GetImagesQuerySchema>;
export type ImageItem = z.infer<typeof ImageItemSchema>;
export type GetImagesResponse = z.infer<typeof GetImagesResponseSchema>;
export type UploadImageRequest = z.infer<typeof UploadImageRequestSchema>;
export type UploadImageResponse = z.infer<typeof UploadImageResponseSchema>;
