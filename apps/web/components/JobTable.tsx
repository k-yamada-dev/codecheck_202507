'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import {
  JobListItem as Job,
  JOB_STATUS,
  JobStatus,
  JOB_TYPE,
} from '@acme/contracts';
import { formatDate } from '@/lib/dateUtils';
import { ImageCell } from '@/components/common/image-cell';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface JobTableProps {
  jobs: Job[];
  onDownloadResult?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
  onRetryJob?: (job: Job) => void;
}

const JobTable: React.FC<JobTableProps> = ({
  jobs = [],
  onDownloadResult,
  onDeleteJob,
  onRetryJob,
}) => {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleDownload = (job: Job, event?: React.MouseEvent) => {
    event?.stopPropagation();
    onDownloadResult?.(job);
  };

  const handleDelete = (job: Job, event?: React.MouseEvent) => {
    event?.stopPropagation();
    onDeleteJob?.(job);
  };

  const handleRetry = (job: Job, event?: React.MouseEvent) => {
    event?.stopPropagation();
    onRetryJob?.(job);
  };

  const getStatusVariant = (status: JobStatus) => {
    switch (status) {
      case JOB_STATUS.DONE:
        return 'default';
      case JOB_STATUS.RUNNING:
        return 'secondary';
      case JOB_STATUS.ERROR:
        return 'destructive';
      case JOB_STATUS.PENDING:
      default:
        return 'outline';
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const getWatermarkText = (job: Job) => {
    if (
      job.type === JOB_TYPE.EMBED &&
      job.params &&
      typeof job.params === 'object' &&
      job.params !== null
    ) {
      const text = (job.params as Record<string, unknown>)['watermark_text'];
      if (typeof text === 'string') {
        return text.length > 16 ? text.slice(0, 16) + '…' : text;
      }
    }
    if (
      job.type === JOB_TYPE.DECODE &&
      job.result &&
      typeof job.result === 'object' &&
      job.result !== null
    ) {
      const text = (job.result as Record<string, unknown>)['detected_text'];
      if (typeof text === 'string') {
        return text.length > 16 ? text.slice(0, 16) + '…' : text;
      }
    }
    return '-';
  };

  const getModeStrength = (job: Job) => {
    if (
      job.type === JOB_TYPE.EMBED &&
      job.params &&
      typeof job.params === 'object' &&
      job.params !== null
    ) {
      const mode = (job.params as Record<string, unknown>)['mode'];
      const strength = (job.params as Record<string, unknown>)['strength'];
      if (typeof mode === 'string' && typeof strength === 'string') {
        return `${mode} / ${strength}`;
      }
    }
    if (
      job.type === JOB_TYPE.DECODE &&
      job.result &&
      typeof job.result === 'object' &&
      job.result !== null
    ) {
      const confidence = (job.result as Record<string, unknown>)['confidence'];
      if (typeof confidence === 'number' || typeof confidence === 'string') {
        return `${confidence}%`;
      }
    }
    return '-';
  };

  const getThumbnail = (job: Job) => {
    if (job.thumbnailPath) {
      return (
        <div className="h-16 w-16">
          <ImageCell path={job.thumbnailPath} alt="thumb" thumb />
        </div>
      );
    }
    return '-';
  };

  return (
    <>
      <DataTable
        data={jobs}
        columns={[
          { header: t('job.table.jobId', 'Job ID'), accessor: 'id' },
          {
            header: t('job.table.status', 'Status'),
            accessor: (job) => (
              <Badge variant={getStatusVariant(job.status)}>
                {t(`job.status.${job.status.toLowerCase()}`, job.status)}
              </Badge>
            ),
          },
          {
            header: t('job.table.startedAt', 'Started At'),
            accessor: (job) => formatDate(job.startedAt),
          },
          { header: t('job.table.user', 'User'), accessor: 'userName' },
          {
            header: t('job.table.duration', 'Duration'),
            accessor: (job) => formatDuration(job.durationMs),
          },
          { header: t('job.table.type', 'Type'), accessor: 'type' },
          {
            header: t('job.table.watermarkText', 'Watermark/Detected Text'),
            accessor: (job) => getWatermarkText(job),
          },
          {
            header: t('job.table.modeStrength', 'Mode/Strength'),
            accessor: (job) => getModeStrength(job),
          },
          {
            header: t('job.table.thumbnail', 'Thumbnail'),
            accessor: (job) => getThumbnail(job),
          },
        ]}
        actions={(job) => [
          {
            label: t('job.actions.download', 'Download'),
            onClick: () => handleDownload(job, undefined),
            disabled: job.status !== JOB_STATUS.DONE,
          },
          {
            label: t('job.actions.retry', 'Retry'),
            onClick: () => handleRetry(job, undefined),
            disabled: job.status !== JOB_STATUS.ERROR,
          },
          {
            label: t('job.actions.delete', 'Delete'),
            onClick: () => handleDelete(job, undefined),
          },
        ]}
      />
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedJob ? t('job.detail.title', 'Job Detail') : ''}
            </SheetTitle>
          </SheetHeader>
          {selectedJob && (
            <div className="space-y-2">
              <div>
                <strong>ID:</strong> {selectedJob.id}
              </div>
              <div>
                <strong>Status:</strong> {selectedJob.status}
              </div>
              <div>
                <strong>Started At:</strong> {formatDate(selectedJob.startedAt)}
              </div>
              <div>
                <strong>User:</strong> {selectedJob.userId}
              </div>
              <div>
                <strong>Duration:</strong>{' '}
                {formatDuration(selectedJob.durationMs)}
              </div>
              <div>
                <strong>Type:</strong> {selectedJob.type}
              </div>
              <div>
                <strong>Params:</strong>{' '}
                <pre>{JSON.stringify(selectedJob.params, null, 2)}</pre>
              </div>
              <div>
                <strong>Result:</strong>{' '}
                <pre>{JSON.stringify(selectedJob.result, null, 2)}</pre>
              </div>
              <div>
                <strong>Thumbnail:</strong> {getThumbnail(selectedJob)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default JobTable;
