import { z, ZodType } from 'zod';
import { JobTypeSchema } from '@/lib/zod/schemas/enums/JobType.schema';
import { JsonNullValueInputSchema } from '@/lib/zod/schemas/enums/JsonNullValueInput.schema';

type Literal = string | number | boolean;
type Json = Literal | { [key: string]: Json | null } | Array<Json | null>;

const literalSchema: ZodType<Literal> = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema: ZodType<Json> = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ])
);

export const jobCreateRequestSchema = z.object({
  type: JobTypeSchema,
  srcImagePath: z.string(),
  thumbnailPath: z.string().optional().nullable(),
  params: z.union([JsonNullValueInputSchema, jsonSchema]),
});

export type JobCreateRequestDTO = z.infer<typeof jobCreateRequestSchema>;
