import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { JobsApiMeta } from '../app/api/_schemas/jobs';
import { ErrorResponseSchema } from '../app/api/_schemas/common';
import { DecodeApiMeta } from '../app/api/_schemas/decode';
import { EncodeApiMeta } from '../app/api/_schemas/encode';
import { ImagesApiMeta } from '../app/api/_schemas/images';
import { UsersApiMeta } from '../app/api/_schemas/users';
import { AdminApiMeta } from '../app/api/_schemas/admin';

// Simplified manual schema definition for Jobs API
function getJobSchemas() {
  return {
    CreateJobRequest: {
      type: 'object',
      required: ['type', 'srcImagePath', 'params'],
      properties: {
        type: {
          type: 'string',
          enum: ['EMBED', 'DECODE'],
        },
        srcImagePath: {
          type: 'string',
          minLength: 1,
        },
        thumbnailPath: {
          type: 'string',
          nullable: true,
        },
        params: {
          type: 'object',
          additionalProperties: true,
        },
      },
    },
    CreateJobResponse: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        tenantId: {
          type: 'string',
        },
        userId: {
          type: 'string',
          format: 'uuid',
        },
        userName: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['EMBED', 'DECODE'],
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'RUNNING', 'DONE', 'ERROR'],
        },
        startedAt: {
          type: 'string',
          format: 'date-time',
        },
        finishedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        durationMs: {
          type: 'integer',
          nullable: true,
        },
        thumbnailPath: {
          type: 'string',
          nullable: true,
        },
        srcImagePath: {
          type: 'string',
        },
        params: {
          type: 'object',
          additionalProperties: true,
        },
        result: {
          type: 'object',
          additionalProperties: true,
        },
        ip: {
          type: 'string',
          nullable: true,
        },
        ua: {
          type: 'string',
          nullable: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        isArchived: {
          type: 'boolean',
        },
        archivedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        imageUrl: {
          type: 'string',
        },
        resultUrl: {
          type: 'string',
          nullable: true,
        },
        watermark: {
          type: 'string',
          nullable: true,
        },
        confidence: {
          type: 'number',
          nullable: true,
        },
      },
    },
    GetJobsResponse: {
      type: 'object',
      properties: {
        jobs: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/CreateJobResponse',
          },
        },
        nextCursor: {
          type: 'string',
          format: 'uuid',
          nullable: true,
        },
        hasNextPage: {
          type: 'boolean',
        },
      },
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
          required: ['code', 'message'],
        },
      },
      required: ['error'],
    },
  };
}

// Generate OpenAPI specification
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Acuagraphy Online API',
    version: '1.0.0',
    description: 'API for watermark embedding and decoding service',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Main API',
    },
  ],
  paths: {
    '/jobs': {
      post: {
        summary: JobsApiMeta.createJob.summary,
        description: JobsApiMeta.createJob.description,
        tags: JobsApiMeta.createJob.tags,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateJobRequest',
              },
            },
          },
        },
        responses: {
          [JobsApiMeta.createJob.statusCode]: {
            description: 'Job created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateJobResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        summary: JobsApiMeta.getJobs.summary,
        description: JobsApiMeta.getJobs.description,
        tags: JobsApiMeta.getJobs.tags,
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'filter',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['all', 'embed', 'decode'],
              default: 'all',
            },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'cursor',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          [JobsApiMeta.getJobs.statusCode]: {
            description: 'Jobs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GetJobsResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad Request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: getJobSchemas(),
  },
};

// Write the OpenAPI spec to file
const outputPath = resolve(process.cwd(), 'openapi.yaml');
const yamlContent = `# Generated OpenAPI specification
# DO NOT EDIT MANUALLY - This file is auto-generated

${JSON.stringify(openApiSpec, null, 2)}
`;

writeFileSync(outputPath, yamlContent, 'utf8');
console.log(`✅ OpenAPI specification generated at: ${outputPath}`);
