'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  JobListItem as Job,
  JobStatus,
  JOB_TYPE,
  JOB_STATUS,
} from '@acme/contracts';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ImageCell } from '@/components/common/image-cell';

interface LogTableProps {
  jobs: Job[];
}

const LogTable: React.FC<LogTableProps> = ({ jobs = [] }) => {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('log.table.jobId', 'Job ID')}</TableHead>
            <TableHead>{t('log.table.status', 'Status')}</TableHead>
            <TableHead>{t('log.table.startedAt', 'Started At')}</TableHead>
            <TableHead>{t('log.table.user', 'User')}</TableHead>
            <TableHead>{t('log.table.duration', 'Duration')}</TableHead>
            <TableHead>{t('log.table.type', 'Type')}</TableHead>
            <TableHead>{t('log.table.watermarkText', 'Watermark/Detected Text')}</TableHead>
            <TableHead>{t('log.table.modeStrength', 'Mode/Strength')}</TableHead>
            <TableHead>{t('log.table.thumbnail', 'Thumbnail')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                {t('log.table.noResults', 'No results.')}
              </TableCell>
            </TableRow>
          ) : (
            jobs.map(job => (
              <TableRow key={job.id} onClick={() => setSelectedJob(job)} className="cursor-pointer">
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(job.status)}>
                    {t(`job.status.${job.status.toLowerCase()}`, job.status)}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(job.startedAt), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell>{job.userName ?? job.userId}</TableCell>
                <TableCell>{formatDuration(job.durationMs)}</TableCell>
                <TableCell>{t(`job.type.${job.type.toLowerCase()}`, job.type)}</TableCell>
                <TableCell title={getWatermarkText(job)}>{getWatermarkText(job)}</TableCell>
                <TableCell>{getModeStrength(job)}</TableCell>
                <TableCell>{getThumbnail(job)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedJob ? t('log.detail.title', 'Job Detail') : ''}</SheetTitle>
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

export default LogTable;
