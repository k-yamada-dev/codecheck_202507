import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { JobsApiMeta } from './schemas/jobs';
import { ImagesApiMeta } from './schemas/images';
import { LogsApiMeta } from './schemas/logs';
import { UsersApiMeta } from './schemas/users';
import { AdminApiMeta } from './schemas/admin';

const c = initContract();

export const contract = c.router({
  jobs: JobsApiMeta,
  images: ImagesApiMeta,
  logs: LogsApiMeta,
  users: UsersApiMeta,
  admin: AdminApiMeta,
  getLogById: {
    method: 'GET',
    path: '/api/v1/logs/:id',
    pathParams: z.object({ id: z.string().cuid() }),
    responses: {
      200: z
        .object({
          id: z.string().cuid(),
          action: z.string(),
          createdAt: z.string(),
          userName: z.string().nullable(),
        })
        .nullable(),
    },
  },
  decode: {
    method: 'POST',
    path: '/api/v1/decode',
    body: z.object({
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
    }),
    responses: {
      200: z.object({
        result: z.string(),
        success: z.boolean().optional(),
        error: z.string().optional(),
      }),
    },
  },
  encode: {
    method: 'POST',
    path: '/api/v1/encode',
    body: z
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
      }),
    responses: {
      200: z.object({
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
      }),
    },
  },
});
