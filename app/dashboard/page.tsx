'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { HardDrive, FileClock, ArrowRight, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const recentJobs = [
  { id: 'JOB-001', type: 'Encode', status: 'Completed', createdAt: '2023-10-27 10:30' },
  { id: 'JOB-002', type: 'Decode', status: 'In Progress', createdAt: '2023-10-27 10:35' },
  { id: 'JOB-003', type: 'Encode', status: 'Failed', createdAt: '2023-10-27 10:40' },
  { id: 'JOB-004', type: 'Encode', status: 'Completed', createdAt: '2023-10-26 18:20' },
  { id: 'JOB-005', type: 'Decode', status: 'Completed', createdAt: '2023-10-26 15:10' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex-grow p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Storage Capacity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>{t('dashboard.storageCapacity')}</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </PopoverTrigger>
                  <PopoverContent>
                    <p>{t('dashboard.storageCapacityDescription')}</p>
                  </PopoverContent>
                </Popover>
              </div>
              <HardDrive className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">650 GB</span>
                <span className="text-sm text-muted-foreground">1 TB</span>
              </div>
              <Progress value={65} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleNavigate('/image-management')}
            >
              {t('dashboard.manageStorage')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Jobs Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>{t('dashboard.recentJobs')}</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </PopoverTrigger>
                  <PopoverContent>
                    <p>{t('dashboard.recentJobsDescription')}</p>
                  </PopoverContent>
                </Popover>
              </div>
              <FileClock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.jobId')}</TableHead>
                  <TableHead>{t('dashboard.jobStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.slice(0, 3).map(job => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === 'Completed'
                            ? 'default'
                            : job.status === 'In Progress'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => handleNavigate('/job')}
            >
              {t('dashboard.viewAllJobs')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
