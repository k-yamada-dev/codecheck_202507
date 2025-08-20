import { z } from 'zod';
// Encode Request Schema - 透かし埋め込み用
export const EncodeRequestSchema = z
    .object({
    inputFileName: z.string().min(1, 'Input file name is required'),
    watermarkText: z.string().optional(),
    watermarkImage: z.string().optional(),
    outputFormat: z.enum(['jpg', 'png', 'webp']).default('jpg'),
    quality: z.number().int().min(1).max(100).default(90),
    blockSize: z.number().int().positive().default(8),
    strength: z.number().min(0.1).max(2.0).default(1.0),
    position: z
        .enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'])
        .default('center'),
    opacity: z.number().min(0).max(1).default(0.5),
    rotation: z.number().min(-180).max(180).default(0),
    scale: z.number().min(0.1).max(5.0).default(1.0),
    logfile: z.string().default('encode.log'),
})
    .refine(data => data.watermarkText || data.watermarkImage, {
    message: 'Either watermarkText or watermarkImage must be provided',
    path: ['watermarkText', 'watermarkImage'],
});
export const EncodeResponseSchema = z.object({
    result: z.string(),
    outputFileName: z.string().optional(),
    success: z.boolean().optional(),
    error: z.string().optional(),
    metadata: z
        .object({
        originalSize: z.number().optional(),
        compressedSize: z.number().optional(),
        compressionRatio: z.number().optional(),
        processingTimeMs: z.number().optional(),
    })
        .optional(),
});
// API Meta information
export const EncodeApiMeta = {
    encode: {
        method: 'POST',
        path: '/encode',
        summary: 'Embed watermark into image',
        description: 'Embeds text or image watermark into the target image with customizable parameters',
        tags: ['encode'],
        requestSchema: EncodeRequestSchema,
        responseSchema: EncodeResponseSchema,
        statusCode: 200,
    },
};
