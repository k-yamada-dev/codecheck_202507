import { z } from 'zod';

const schema = z.object({
  GCS_BUCKET_NAME: z.string().min(1),
  GCS_SIGNED_URL_TTL: z.string().default('1800'), // seconds
});

export const env = schema.parse(process.env);
