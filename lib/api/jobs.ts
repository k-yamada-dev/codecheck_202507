import { Job, JobType } from '@prisma/client';

export interface JobsResponse {
  jobs: Job[];
  nextCursor: string | null;
}

export interface FetchJobsParams {
  pageParam: string | null; // for infinite query
  filter?: 'all' | 'embed' | 'decode';
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  userId?: string;
}

export const fetchJobs = async ({
  pageParam,
  filter = 'all',
  search,
  startDate,
  endDate,
  limit = 50,
  userId,
}: FetchJobsParams): Promise<JobsResponse> => {
  const params = new URLSearchParams();

  if (pageParam) {
    params.append('cursor', pageParam);
  }
  if (userId) {
    params.append('userId', userId);
  }
  if (filter !== 'all') {
    params.append('filter', filter);
  }
  if (search) {
    params.append('search', search);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  params.append('limit', String(limit));

  const response = await fetch(`/api/v1/jobs?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.title || 'Failed to fetch jobs');
  }

  return response.json();
};

export interface CreateJobPayload {
  type: JobType;
  srcImagePath: string;
  thumbnailPath?: string;
  params: Record<string, unknown>;
}

export const createJob = async (payload: CreateJobPayload): Promise<Job> => {
  const response = await fetch('/api/v1/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.title || 'Failed to create job');
  }

  return response.json();
};
