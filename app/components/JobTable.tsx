'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from './DataTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Job, JobStatus } from '@prisma/client';
import { format } from 'date-fns';
import Image from 'next/image';
import { Download, MoreHorizontal, Trash2, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
      case JobStatus.DONE:
        return 'default';
      case JobStatus.RUNNING:
        return 'secondary';
      case JobStatus.ERROR:
        return 'destructive';
      case JobStatus.PENDING:
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
      job.type === 'EMBED' &&
      job.params &&
      typeof job.params === 'object' &&
      job.params !== null
    ) {
      const text = (job.params as any)['watermark_text'];
      if (typeof text === 'string') {
        return text.length > 16 ? text.slice(0, 16) + '…' : text;
      }
    }
    if (
      job.type === 'DECODE' &&
      job.result &&
      typeof job.result === 'object' &&
      job.result !== null
    ) {
      const text = (job.result as any)['detected_text'];
      if (typeof text === 'string') {
        return text.length > 16 ? text.slice(0, 16) + '…' : text;
      }
    }
    return '-';
  };

  const getModeStrength = (job: Job) => {
    if (
      job.type === 'EMBED' &&
      job.params &&
      typeof job.params === 'object' &&
      job.params !== null
    ) {
      const mode = (job.params as any)['mode'];
      const strength = (job.params as any)['strength'];
      if (typeof mode === 'string' && typeof strength === 'string') {
        return `${mode} / ${strength}`;
      }
    }
    if (
      job.type === 'DECODE' &&
      job.result &&
      typeof job.result === 'object' &&
      job.result !== null
    ) {
      const confidence = (job.result as any)['confidence'];
      if (typeof confidence === 'number' || typeof confidence === 'string') {
        return `${confidence}%`;
      }
    }
    return '-';
  };

  const getThumbnail = (job: Job) => {
    if (job.thumbnailPath) {
      return (
        <Image src={job.thumbnailPath} alt="thumb" width={64} height={64} className="rounded" />
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
            accessor: job => (
              <Badge variant={getStatusVariant(job.status)}>
                {t(`job.status.${job.status.toLowerCase()}`, job.status)}
              </Badge>
            ),
          },
          {
            header: t('job.table.startedAt', 'Started At'),
            accessor: job => format(new Date(job.startedAt), 'yyyy-MM-dd HH:mm:ss'),
          },
          { header: t('job.table.user', 'User'), accessor: 'userName' },
          {
            header: t('job.table.duration', 'Duration'),
            accessor: job => formatDuration(job.durationMs),
          },
          { header: t('job.table.type', 'Type'), accessor: 'type' },
          {
            header: t('job.table.watermarkText', 'Watermark/Detected Text'),
            accessor: job => getWatermarkText(job),
          },
          {
            header: t('job.table.modeStrength', 'Mode/Strength'),
            accessor: job => getModeStrength(job),
          },
          {
            header: t('job.table.thumbnail', 'Thumbnail'),
            accessor: job => getThumbnail(job),
          },
        ]}
        actions={job => [
          {
            label: t('job.actions.download', 'Download'),
            onClick: () => handleDownload(job, undefined),
            disabled: job.status !== JobStatus.DONE,
          },
          {
            label: t('job.actions.retry', 'Retry'),
            onClick: () => handleRetry(job, undefined),
            disabled: job.status !== JobStatus.ERROR,
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
            <SheetTitle>{selectedJob ? t('job.detail.title', 'Job Detail') : ''}</SheetTitle>
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
                <strong>Started At:</strong>{' '}
                {format(new Date(selectedJob.startedAt), 'yyyy-MM-dd HH:mm:ss')}
              </div>
              <div>
                <strong>User:</strong> {selectedJob.userId}
              </div>
              <div>
                <strong>Duration:</strong> {formatDuration(selectedJob.durationMs)}
              </div>
              <div>
                <strong>Type:</strong> {selectedJob.type}
              </div>
              <div>
                <strong>Params:</strong> <pre>{JSON.stringify(selectedJob.params, null, 2)}</pre>
              </div>
              <div>
                <strong>Result:</strong> <pre>{JSON.stringify(selectedJob.result, null, 2)}</pre>
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
