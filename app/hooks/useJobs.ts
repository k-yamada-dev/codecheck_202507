import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobs, FetchJobsParams } from '@/lib/api/jobs';

type UseJobsParams = Omit<FetchJobsParams, 'pageParam'>;

export const useJobs = (params: UseJobsParams) =>
  useInfiniteQuery({
    queryKey: ['jobs', params],
    queryFn: ({ pageParam }: { pageParam?: string | null }) =>
      fetchJobs({ ...params, pageParam: pageParam ?? null }),
    initialPageParam: null as string | null,
    getNextPageParam: last => last.nextCursor ?? null,
  });
