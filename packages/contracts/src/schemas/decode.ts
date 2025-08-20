import { z } from 'zod';

// Decode Request Schema - DTOクラスをZod化
export const DecodeRequestSchema = z.object({
  inputFileName: z.string().min(1, 'Input file name is required'),
  blockSize: z.number().int().positive().default(8),
  timer: z.number().int().positive().default(60),
  widthScalingFrom: z.number().min(0.1).max(10).default(0.5),
  widthScalingTo: z.number().min(0.1).max(10).default(2.0),
  heightScalingFrom: z.number().min(0.1).max(10).default(0.5),
  heightScalingTo: z.number().min(0.1).max(10).default(2.0),
  rotationFrom: z.number().min(-180).max(180).default(-45),
  rotationTo: z.number().min(-180).max(180).default(45),
  logfile: z.string().default('decode.log'),
});

export const DecodeResponseSchema = z.object({
  result: z.string(),
  success: z.boolean().optional(),
  error: z.string().optional(),
});

// API Meta information
export const DecodeApiMeta = {
  decode: {
    method: 'POST' as const,
    path: '/decode',
    summary: 'Decode watermark from image',
    description:
      'Extracts watermark information from an image using various transformation parameters',
    tags: ['decode'],
    requestSchema: DecodeRequestSchema,
    responseSchema: DecodeResponseSchema,
    statusCode: 200,
  },
} as const;

// Type exports
export type DecodeRequest = z.infer<typeof DecodeRequestSchema>;
export type DecodeResponse = z.infer<typeof DecodeResponseSchema>;
