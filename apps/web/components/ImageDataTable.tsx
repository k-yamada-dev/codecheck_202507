'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { ImageItem, GetImagesResponse } from '@acme/contracts';

type JobWithParsedParams = ImageItem & {
  params: {
    originalFileName?: string;
  };
};

import { ImageCell } from '@/components/common/image-cell';

function ImageRow({ path }: { path: string | null }) {
  return (
    <div className="h-16 w-16">
      <ImageCell path={path} alt="Thumbnail" thumb />
    </div>
  );
}

export function ImageDataTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['images', 'list', { page }],
    queryFn: async () => {
      const response = await apiClient.images.getImages({
        query: { page },
      });
      return response.body as GetImagesResponse;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.images.archiveImage({
        params: { id },
        body: {},
      });
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', 'list'] });
    },
  });

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null
  );

  const handleArchiveClick = (id: string) => {
    setSelectedImageId(id);
    setIsAlertOpen(true);
  };

  const handleConfirmArchive = () => {
    if (selectedImageId) {
      archiveMutation.mutate(selectedImageId, {
        onSuccess: () => {
          setIsAlertOpen(false);
          setSelectedImageId(null);
        },
      });
    }
  };

  const columns: ColumnDef<JobWithParsedParams>[] = [
    {
      accessorKey: 'thumbnailPath',
      header: t('imageManagement.table.header.thumbnail'),
      cell: ({ row }) => <ImageRow path={row.original.thumbnailPath} />,
    },
    {
      accessorKey: 'srcImagePath',
      header: t('imageManagement.table.header.fileName'),
      cell: ({ row }) => {
        const fileName =
          row.original.params?.originalFileName ||
          row.original.srcImagePath.split('/').pop();
        return <span className="font-medium">{fileName}</span>;
      },
    },
    {
      accessorKey: 'userName',
      header: t('imageManagement.table.header.uploader'),
    },
    {
      accessorKey: 'createdAt',
      header: t('imageManagement.table.header.createdAt'),
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleArchiveClick(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('imageManagement.action.archive')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const jobs: JobWithParsedParams[] =
    data?.data?.map((job: ImageItem) => ({
      ...job,
      params: (job.params as { originalFileName?: string }) ?? {},
    })) ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: total,
  });

  if (isLoading) return <div>{t('common.loading')}...</div>;
  if (error)
    return (
      <div>
        {t('common.error.generic')}: {error.message}
      </div>
    );

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('imageManagement.table.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page <= 1}
        >
          {t('common.pagination.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages}
        >
          {t('common.pagination.next')}
        </Button>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('imageManagement.dialog.archive.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('imageManagement.dialog.archive.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.action.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive}>
              {t('common.action.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
