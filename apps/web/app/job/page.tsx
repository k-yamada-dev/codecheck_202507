'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import JobTable from '@/components/JobTable';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import type {
  JobListItem,
  CreateJobRequest,
  GetJobsResponse,
} from '@acme/contracts';
import { JOB_STATUS } from '@acme/contracts';
import { toast } from 'sonner';
import { handleUIError } from '@/lib/errors/uiHandler';

export default function JobPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    filter: 'all' as 'all' | 'embed' | 'decode',
    search: '',
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['jobs', 'all', filters],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.jobs.getJobs({
        query: { ...filters, cursor: pageParam as string | undefined },
      });
      return response.body as GetJobsResponse;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetJobsResponse) => lastPage.nextCursor,
    refetchInterval: (query) => {
      const jobs =
        query.state.data?.pages.flatMap((page: GetJobsResponse) => page.jobs) ??
        [];
      const hasActiveJobs = jobs.some(
        (job) =>
          job.status === JOB_STATUS.PENDING || job.status === JOB_STATUS.RUNNING
      );
      return hasActiveJobs ? 5000 : false;
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiClient.jobs.deleteJob({
        params: { id: jobId },
      });
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'all'] });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      const response = await apiClient.jobs.createJob({ body: data });
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'all'] });
    },
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const handleFilterChange =
    (name: keyof typeof filters) => (value: string) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
    };

  const jobs = useMemo(
    () =>
      (data?.pages as GetJobsResponse[])?.flatMap((page) => page.jobs) ?? [],
    [data]
  );

  const handleDownloadResult = (job: JobListItem) => {
    if (job.srcImagePath) {
      window.open(job.srcImagePath, '_blank');
      toast.success(t('job.actions.downloadSuccess', 'Download started'));
    } else {
      toast.error(
        t('job.actions.downloadError', 'No file available for download')
      );
    }
  };

  const handleDeleteJob = (job: JobListItem) => {
    deleteJobMutation.mutate(job.id, {
      onSuccess: () => {
        toast.success(
          t('job.actions.deleteSuccess', 'Job deleted successfully')
        );
      },
      onError: (error) => {
        handleUIError(error);
      },
    });
  };

  const handleRetryJob = (job: JobListItem) => {
    createJobMutation.mutate(
      {
        type: job.type,
        srcImagePath: job.srcImagePath || '',
        payload: job.params || {},
      },
      {
        onSuccess: () => {
          toast.success(t('job.actions.retrySuccess', 'Job retry started'));
        },
        onError: (error) => {
          handleUIError(error);
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('job.filters.title', 'Filters')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Input
            placeholder={t(
              'job.filters.searchPlaceholder',
              'Search by ID, text...'
            )}
            value={filters.search}
            onChange={(e) => handleFilterChange('search')(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={filters.filter}
            onValueChange={handleFilterChange('filter')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t('job.filters.typePlaceholder', 'Filter by type')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('job.filters.all', 'All')}</SelectItem>
              <SelectItem value="embed">
                {t('job.filters.embed', 'Embed')}
              </SelectItem>
              <SelectItem value="decode">
                {t('job.filters.decode', 'Decode')}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isFetching && !isFetchingNextPage ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">
          {t('job.error', 'Failed to load jobs:')} {error.message}
        </div>
      ) : (
        <JobTable
          jobs={jobs}
          onDownloadResult={handleDownloadResult}
          onDeleteJob={handleDeleteJob}
          onRetryJob={handleRetryJob}
        />
      )}

      <div ref={ref} className="h-10">
        {isFetchingNextPage && (
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span>{t('job.loadingMore', 'Loading more...')}</span>
          </div>
        )}
      </div>

      {!hasNextPage && jobs.length > 0 && (
        <p className="text-center text-muted-foreground">
          {t('job.noMoreResults', 'No more results.')}
        </p>
      )}
    </div>
  );
}
