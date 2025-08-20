'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import LogTable from '@/components/LogTable'; // Assuming LogTable will be adapted
import { useDebounce } from 'use-debounce';
import type { JobListItem, GetJobsResponse } from '@acme/contracts';

type FilterType = 'all' | 'embed' | 'decode';

export default function LogPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  // TODO: Implement DateRangePicker
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const jobQuery = useInfiniteQuery({
    queryKey: [
      'jobs',
      'all',
      {
        filter,
        search: debouncedSearchTerm,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    ],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.jobs.getJobs({
        query: {
          filter,
          search: debouncedSearchTerm,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          cursor: pageParam as string | undefined,
        },
      });
      return response.body as GetJobsResponse;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetJobsResponse) => lastPage.nextCursor,
  });

  const jobs = useMemo(
    () => jobQuery.data?.pages.flatMap((page) => page.jobs) ?? [],
    [jobQuery.data]
  );

  return (
    <div className="container mx-auto p-4">
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as FilterType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">{t('log.tabs.all', 'All')}</TabsTrigger>
          <TabsTrigger value="embed">
            {t('log.tabs.embed', 'Embed')}
          </TabsTrigger>
          <TabsTrigger value="decode">
            {t('log.tabs.decode', 'Decode')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="my-4">
        <CardHeader>
          <CardTitle>{t('log.filter.title', 'Filter Logs')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder={t(
                'log.filter.search',
                'Search Job ID, user, text...'
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button
              onClick={() => jobQuery.refetch()}
              disabled={jobQuery.isFetching}
            >
              {jobQuery.isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('log.filter.apply', 'Apply')}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('log.exportCsv', 'Export CSV')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {jobQuery.isLoading && (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {jobQuery.isError && (
        <div className="text-center text-red-500">
          {t('log.error', 'Failed to load logs.')}
        </div>
      )}

      {!jobQuery.isLoading && !jobQuery.isError && (
        <>
          <LogTable jobs={jobs} />
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => jobQuery.fetchNextPage()}
              disabled={!jobQuery.hasNextPage || jobQuery.isFetchingNextPage}
            >
              {jobQuery.isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  {t('log.loadingMore', 'Loading...')}
                </>
              ) : (
                t('log.loadMore', 'Load More')
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
