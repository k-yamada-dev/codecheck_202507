import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

import { AdminApiMeta } from '../app/api/_schemas/admin';

// Generate TanStack Query hooks for each API endpoint
function generateJobsHooks() {
  const hooksContent = `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from app/api/_schemas/jobs.ts

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '../client/api';
import type {
  CreateJobRequest,
  CreateJobResponse,
  GetJobsQuery,
  GetJobsResponse,
} from '../client/api';

// Query Keys
export const jobsKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsKeys.all, 'list'] as const,
  list: (filters: Partial<GetJobsQuery>) => [...jobsKeys.lists(), filters] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsKeys.details(), id] as const,
} as const;

// API Client Functions (using generated client)
export const jobsApi = {
  getJobs: (params: GetJobsQuery) => apiClient.getJobs(params),
  createJob: (data: CreateJobRequest) => apiClient.createJob(data),
} as const;

// Hooks
export const useJobs = (params: Omit<GetJobsQuery, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: jobsKeys.list(params),
    queryFn: ({ pageParam }) => 
      jobsApi.getJobs({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateJobResponse, ApiError, CreateJobRequest>({
    mutationFn: jobsApi.createJob,
    onSuccess: () => {
      // Invalidate and refetch jobs queries
      queryClient.invalidateQueries({ queryKey: jobsKeys.all });
    },
    onError: (error) => {
      console.error('Failed to create job:', error);
    },
  });
};

// Additional utility hooks
export const useJobsQuery = (params: GetJobsQuery) => {
  return useQuery({
    queryKey: jobsKeys.list(params),
    queryFn: () => jobsApi.getJobs(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
`;

  return hooksContent.trim();
}

// Generate the hooks file
const hooksContent = generateJobsHooks();

// --- Tenants hooks generation ---
function generateTenantsHooks() {
  // getTenants API meta
  const getTenants = AdminApiMeta.getTenants;
  return `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from app/api/_schemas/admin.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '../client/api';
import type { GetTenantsResponse } from '../client/api';

export const tenantsKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantsKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...tenantsKeys.lists(), filters] as const,
};

export const tenantsApi = {
  getTenants: () => apiClient.getTenants(),
};

export const useTenants = () => {
  return useQuery<GetTenantsResponse, ApiError>({
    queryKey: tenantsKeys.all,
    queryFn: tenantsApi.getTenants,
    staleTime: 1000 * 60 * 5,
  });
};
`.trim();
}

const tenantsHooksContent = generateTenantsHooks();

import { ImagesApiMeta } from '../app/api/_schemas/images';

// --- Images hooks generation ---
function generateImagesHooks() {
  return `
// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated from app/api/_schemas/images.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client/api';

export const imagesKeys = {
  all: ['images'] as const,
  lists: () => [...imagesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...imagesKeys.lists(), filters] as const,
};

export const imagesApi = {
  getImages: (params?: Record<string, any>) => apiClient.getImages(params),
};

export const useImages = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: imagesKeys.list(params),
    queryFn: () => imagesApi.getImages(params),
    staleTime: 1000 * 60 * 5,
  });
};
`.trim();
}

const imagesHooksContent = generateImagesHooks();

// Ensure the directory exists
const outputDir = resolve(process.cwd(), '__generated__/hooks');
mkdirSync(outputDir, { recursive: true });

// Write the hooks files
const outputPathJobs = resolve(outputDir, 'useJobs.ts');
writeFileSync(outputPathJobs, hooksContent, 'utf8');

const outputPathTenants = resolve(outputDir, 'useTenants.ts');
writeFileSync(outputPathTenants, tenantsHooksContent, 'utf8');

const outputPathImages = resolve(outputDir, 'useImages.ts');
writeFileSync(outputPathImages, imagesHooksContent, 'utf8');

console.log(`✅ TanStack Query hooks generated at: ${outputPathJobs}`);
console.log(`✅ TanStack Query hooks generated at: ${outputPathTenants}`);
console.log(`✅ TanStack Query hooks generated at: ${outputPathImages}`);
