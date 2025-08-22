import { createRouteHandler } from '@/lib/ts-rest/next-handler';
import {
  contract,
  JOB_TYPE,
  type GetImagesQuery,
  type UploadImageRequest,
  type ImageItem,
} from '@acme/contracts';
import {
  jobsRepo,
  type JobListItemFromRepo,
  type FindJobsQuery,
} from '@acme/db';
import { getSessionInfo } from '@/lib/utils/apiAuth';
import { getSignedUrl } from '@/lib/gcs/storage.server';

interface ImageQueryOptions extends FindJobsQuery {
  type: JOB_TYPE;
  isArchived: boolean;
  page?: number;
  sortBy?: GetImagesQuery['sortBy'];
  sortOrder?: GetImagesQuery['sortOrder'];
}

interface ArchiveImageParams {
  id: string;
}

const router = createRouteHandler(contract.images, {
  getImages: async ({ query }: { query: GetImagesQuery }) => {
    try {
      // Get session information
      const { tenantId } = await getSessionInfo();

      const { page, limit, sortBy, sortOrder, search, userId, startDate, endDate } = query;

      // Build filter conditions
      const filters: ImageQueryOptions = {
        tenantId,
        type: JOB_TYPE.EMBED,
        isArchived: false,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Add additional filters
      if (search) {
        filters.search = search;
      }

      if (userId) {
        filters.userId = userId;
      }

      if (startDate) {
        filters.startDate = startDate;
      }

      if (endDate) {
        filters.endDate = endDate;
      }

      const result = await jobsRepo.findMany(filters);

      const images: ImageItem[] = result.jobs.map((job: JobListItemFromRepo) => ({
        id: job.id,
        srcImagePath: job.srcImagePath,
        thumbnailPath: job.thumbnailPath,
        userName: job.userName,
        createdAt: job.createdAt.toISOString(),
        params: job.params,
      }));

      return {
        status: 200,
        body: {
          data: images,
          meta: {
            total: result.jobs.length,
            page,
            limit,
            totalPages: Math.ceil(result.jobs.length / limit),
          },
        },
      };
    } catch (error) {
      console.error('Images API error:', error);
      return {
        status: 500,
        body: {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        },
      };
    }
  },
  uploadImage: async ({ body }: { body: UploadImageRequest }) => {
    try {
      // Generate signed URL for upload
      const uploadUrl = await getSignedUrl(`${body.folder}/${body.fileName}`, 3600);
      const downloadUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${body.folder}/${body.fileName}`;
      const filePath = `${body.folder}/${body.fileName}`;

      return {
        status: 200,
        body: {
          uploadUrl,
          downloadUrl,
          filePath,
          expiresIn: 3600,
        },
      };
    } catch (error) {
      console.error('Upload Image API error:', error);
      return {
        status: 500,
        body: {
          uploadUrl: '',
          filePath: '',
          expiresIn: 0,
        },
      };
    }
  },
  archiveImage: async ({ params }: { params: ArchiveImageParams }) => {
    try {
      const { tenantId } = await getSessionInfo();

      // Find the job/image
      const job = await jobsRepo.findById(params.id);
      if (!job || job.tenantId !== tenantId) {
        return {
          status: 404,
          body: {
            id: '',
            srcImagePath: '',
            thumbnailPath: null,
            userName: '',
            createdAt: '',
            params: null,
          },
        };
      }

      // Archive the image (soft delete) - simplified implementation
      // Note: This would need proper archive functionality in jobsRepo
      console.log(`Archiving image with ID: ${params.id}`);

      return {
        status: 200,
        body: {
          id: job.id,
          srcImagePath: job.srcImagePath,
          thumbnailPath: job.thumbnailPath,
          userName: job.userName,
          createdAt: job.createdAt.toISOString(),
          params: job.params as Record<string, unknown> | null,
        },
      };
    } catch (error) {
      console.error('Archive Image API error:', error);
      return {
        status: 500,
        body: {
          id: '',
          srcImagePath: '',
          thumbnailPath: null,
          userName: '',
          createdAt: '',
          params: null,
        },
      };
    }
  },
});

export const GET = router.getImages;
export const POST = router.uploadImage;
export const PATCH = router.archiveImage;
