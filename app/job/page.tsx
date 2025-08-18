'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/__generated__/client/api';
import { useJobsCreateJob, useJobsDeleteJob, queryKeys } from '@/__generated__/hooks';
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
import { Job } from '@prisma/client';
import { toast } from 'sonner';
import { handleUIError } from '@/lib/errors/uiHandler';

export default function JobPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    filter: 'all' as 'all' | 'embed' | 'decode',
    search: '',
  });

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [queryKeys.jobs.all, filters],
      queryFn: ({ pageParam }) =>
        apiClient.jobsGetJobs({ query: { ...filters, cursor: pageParam } }),
      initialPageParam: undefined,
      getNextPageParam: lastPage => lastPage.nextCursor,
      refetchInterval: query => {
        const jobs = query.state.data?.pages.flatMap(page => page.jobs) ?? [];
        const hasActiveJobs = jobs.some(
          job => job.status === 'PENDING' || job.status === 'RUNNING'
        );
        return hasActiveJobs ? 5000 : false;
      },
    });

  const deleteJobMutation = useJobsDeleteJob();
  const createJobMutation = useJobsCreateJob();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const handleFilterChange = (name: keyof typeof filters) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const jobs = useMemo(() => data?.pages.flatMap(page => page.jobs) ?? [], [data]);

  const handleDownloadResult = (job: Job) => {
    if (job.srcImagePath) {
      window.open(job.srcImagePath, '_blank');
      toast.success(t('job.actions.downloadSuccess', 'Download started'));
    } else {
      toast.error(t('job.actions.downloadError', 'No file available for download'));
    }
  };

  const handleDeleteJob = (job: Job) => {
    // TODO: The generated client for DELETE is incorrect. It should take `params`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteJobMutation.mutate({ params: { id: job.id } } as any, {
      onSuccess: () => {
        toast.success(t('job.actions.deleteSuccess', 'Job deleted successfully'));
        queryClient.invalidateQueries({ queryKey: [queryKeys.jobs.all] });
      },
      onError: error => {
        handleUIError(error);
      },
    });
  };

  const handleRetryJob = (job: Job) => {
    createJobMutation.mutate(
      {
        body: {
          type: job.type,
          srcImagePath: job.srcImagePath,
          thumbnailPath: job.thumbnailPath,
          params: job.params,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('job.actions.retrySuccess', 'Job retry started'));
          queryClient.invalidateQueries({ queryKey: [queryKeys.jobs.all] });
        },
        onError: error => {
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
            placeholder={t('job.filters.searchPlaceholder', 'Search by ID, text...')}
            value={filters.search}
            onChange={e => handleFilterChange('search')(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filters.filter} onValueChange={handleFilterChange('filter')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('job.filters.typePlaceholder', 'Filter by type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('job.filters.all', 'All')}</SelectItem>
              <SelectItem value="embed">{t('job.filters.embed', 'Embed')}</SelectItem>
              <SelectItem value="decode">{t('job.filters.decode', 'Decode')}</SelectItem>
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
