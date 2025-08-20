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
  createdAt: z.string().datetime(),
  params: z.record(z.string(), z.any()).nullable(),
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

// Images API Meta
export const ImagesApiMeta = {
  getImages: {
    method: 'GET' as const,
    path: '/api/v1/images',
    query: GetImagesQuerySchema,
    responses: {
      200: GetImagesResponseSchema,
    },
  },
  uploadImage: {
    method: 'POST' as const,
    path: '/api/v1/images/upload',
    body: UploadImageRequestSchema,
    responses: {
      200: UploadImageResponseSchema,
    },
  },
  archiveImage: {
    method: 'PATCH' as const,
    path: '/api/v1/images/:id',
    pathParams: z.object({ id: z.string().uuid() }),
    body: z.object({}), // Empty body for PATCH request
    responses: {
      200: ImageItemSchema,
    },
  },
};

// Type exports
export type GetImagesQuery = z.infer<typeof GetImagesQuerySchema>;
export type ImageItem = z.infer<typeof ImageItemSchema>;
export type GetImagesResponse = z.infer<typeof GetImagesResponseSchema>;
export type UploadImageRequest = z.infer<typeof UploadImageRequestSchema>;
export type UploadImageResponse = z.infer<typeof UploadImageResponseSchema>;
