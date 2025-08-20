import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, createQueryKey } from '@/lib/api/client';
import type { GetJobsQuery, CreateJobRequest } from '@acme/contracts';

// Jobs一覧取得
export const useJobs = (query?: GetJobsQuery) => {
  return useQuery({
    queryKey: createQueryKey('jobs', query),
    queryFn: () => apiClient.jobs.getJobs({ query: query || {} }),
  });
};

// Job作成
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobRequest) =>
      apiClient.jobs.createJob({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

// Job削除
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.jobs.deleteJob({ params: { id }, body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
