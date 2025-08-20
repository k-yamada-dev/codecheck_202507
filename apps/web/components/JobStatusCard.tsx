'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { JobStatus } from '@prisma/client';

interface JobStatusCardProps {
  jobId: string;
  status: JobStatus;
  progress?: number;
  createdAt: string;
}

const statusMap: Record<
  JobStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  [JobStatus.PENDING]: { label: 'Pending', variant: 'outline' },
  [JobStatus.RUNNING]: { label: 'Running', variant: 'secondary' },
  [JobStatus.DONE]: { label: 'Completed', variant: 'default' },
  [JobStatus.ERROR]: { label: 'Failed', variant: 'destructive' },
};

const JobStatusCard: React.FC<JobStatusCardProps> = ({ jobId, status, progress, createdAt }) => {
  const { label, variant } = statusMap[status] ?? { label: 'Unknown', variant: 'outline' };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Job ID: {jobId}</CardTitle>
        <Badge variant={variant}>{label}</Badge>
      </CardHeader>
      <CardContent>
        {status === JobStatus.RUNNING && progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">Created at: {createdAt}</p>
      </CardContent>
    </Card>
  );
};

export default JobStatusCard;
