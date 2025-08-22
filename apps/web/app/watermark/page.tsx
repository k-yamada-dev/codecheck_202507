'use client';

import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageDropzone from '@/components/ImageDropzone';
import WatermarkTable, {
  WatermarkImage,
  WatermarkSettings,
} from '@/components/WatermarkTable';
import { WatermarkParamForm } from '@/components/WatermarkParamForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { handleUIError } from '@/lib/errors/uiHandler';
import { uploadFile } from '@/lib/gcs/upload.client';
  import {
    useInfiniteQuery,
    useQueryClient,
    useMutation,
  } from '@tanstack/react-query';
  import { apiClient } from '@/lib/api/client';
  import type {
    JobListItem,
    GetJobsResponse,
    CreateJobRequest,
    JobResponse,
  } from '@acme/contracts';
  import { JOB_TYPE } from '@acme/contracts';
  import { useSession } from 'next-auth/react';

const defaultWatermarkSettings: WatermarkSettings = {
  text: 'ACUA-2025',
  encodeMode: '通常',
  jpegEmbedMode: '通常',
  strength: 3,
  blockSize: '自動設定',
  jpegQuality: 90,
};

const WatermarkPage: React.FC = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<WatermarkImage[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
    new Set()
  );

  const createJobMutation = useMutation<JobResponse, Error, CreateJobRequest>({
    mutationFn: async (data: CreateJobRequest) => {
      const response = await apiClient.jobs.createJob({
        body: data,
      });
      return response.body;
    },
  });

  // 現在のユーザーの実行済みJOBを取得
  const { data: jobsData } = useInfiniteQuery<GetJobsResponse, Error>({
    queryKey: ['jobs', 'all', { filter: 'embed', userId: session?.user?.id }],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.jobs.getJobs({
        query: {
          filter: 'embed',
          cursor: pageParam as string | undefined,
        },
      });
      return response.body as GetJobsResponse;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetJobsResponse) => lastPage.nextCursor,
    enabled: !!session?.user?.id,
  });

  // 実行済みJOBをWatermarkImage形式に変換
  const jobImages: WatermarkImage[] = React.useMemo(() => {
    if (!jobsData) return [];

    return jobsData.pages.flatMap((page) =>
      page.jobs
        ? page.jobs.map((job: JobListItem) => ({
            id: job.id,
            file: new File(
              [],
              job.srcImagePath?.split('/').pop() || 'unknown.jpg'
            ),
            previewUrl: job.thumbnailPath || job.srcImagePath || '',
            settings: {
              text:
                ((job.params as Record<string, unknown>)
                  ?.watermarkText as string) || '',
              encodeMode:
                ((job.params as Record<string, unknown>)
                  ?.encodeMode as string) || '通常',
              jpegEmbedMode:
                ((job.params as Record<string, unknown>)
                  ?.jpegEmbedMode as string) || '通常',
              strength:
                ((job.params as Record<string, unknown>)?.strength as number) ||
                3,
              blockSize:
                ((job.params as Record<string, unknown>)
                  ?.blockSize as string) || '自動設定',
              jpegQuality:
                ((job.params as Record<string, unknown>)
                  ?.jpegQuality as number) || 90,
            } as WatermarkSettings,
            status:
              job.status === 'DONE'
                ? 'success'
                : job.status === 'ERROR'
                  ? 'error'
                  : job.status === 'RUNNING'
                    ? 'running'
                    : 'pending',
            jobId: job.id,
            uploadedFileUrl: job.srcImagePath || undefined,
            thumbnailPath: job.thumbnailPath || undefined,
            isUploaded: !!job.thumbnailPath,
          }))
        : []
    );
  }, [jobsData]);

  // 未実行の画像と実行済みJOBをマージ
  const allImages = React.useMemo(() => {
    return [...jobImages, ...images];
  }, [jobImages, images]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: WatermarkImage[] = acceptedFiles.map((file) => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      settings: { ...defaultWatermarkSettings },
      status: 'idle',
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  }, []);

  const handleUpdateImageSettings = useCallback(
    (id: string, updatedSettings: Partial<WatermarkSettings>) => {
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === id
            ? { ...img, settings: { ...img.settings, ...updatedSettings } }
            : img
        )
      );
    },
    []
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
    setSelectedImageIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleApplyAllSettings = useCallback(
    (settings: Partial<WatermarkSettings> & { autoIncrement?: boolean }) => {
      setImages((prevImages) => {
        const newImages = prevImages.map((img) => {
          if (!selectedImageIds.has(img.id)) return img;

          // 自動連番
          if (settings.autoIncrement && settings.text !== undefined) {
            const selectedImages = prevImages.filter((i) =>
              selectedImageIds.has(i.id)
            );
            const index = selectedImages.indexOf(img);
            const newText = `${settings.text}_${index + 1}`;

            // autoIncrement を除外
            const { autoIncrement, ...restSettings } = settings;
            void autoIncrement;
            return {
              ...img,
              settings: { ...img.settings, ...restSettings, text: newText },
            };
          }

          const { autoIncrement, ...restSettings } = settings;
          void autoIncrement;
          return { ...img, settings: { ...img.settings, ...restSettings } };
        });
        return newImages;
      });
    },
    [selectedImageIds]
  );

  const handleEncode = useCallback(async () => {
    const imagesToEncode = images.filter(
      (img) =>
        selectedImageIds.has(img.id) &&
        (img.status === 'idle' || img.status === 'error')
    );

    if (imagesToEncode.length === 0) {
      toast.info('エンコード対象の画像が選択されていません。');
      return;
    }

    setImages((prevImages) =>
      prevImages.map((img) =>
        imagesToEncode.some((encImg) => encImg.id === img.id)
          ? { ...img, status: 'pending' }
          : img
      )
    );

    for (const image of imagesToEncode) {
      try {
        // ファイルアップロード
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === image.id ? { ...img, status: 'uploading' } : img
          )
        );
        const { filePath, thumbnailPath } = await uploadFile<{
          filePath: string;
          thumbnailPath: string;
        }>(image.file);
        const uploadedFileUrl = filePath;

        // エンコード
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === image.id
              ? { ...img, status: 'running', uploadedFileUrl }
              : img
          )
        );

        const jobParams = {
          watermarkText: image.settings.text,
          encodeMode: image.settings.encodeMode,
          jpegEmbedMode: image.settings.jpegEmbedMode,
          strength: image.settings.strength,
          blockSize: image.settings.blockSize,
          jpegQuality: image.settings.jpegQuality,
        };

        createJobMutation.mutate(
          {
            type: JOB_TYPE.EMBED,
            srcImagePath: uploadedFileUrl,
            payload: jobParams,
          },
          {
            onSuccess: (newJob: JobResponse) => {
              setImages((prevImages) =>
                prevImages.map((img) =>
                  img.id === image.id
                    ? { ...img, status: 'pending', jobId: newJob.id } // Store jobId for tracking
                    : img
                )
              );
              toast.success(
                `${image.file.name} の透かし埋込ジョブが開始されました。`
              );
              queryClient.invalidateQueries({ queryKey: ['jobs', 'all'] });
            },
            onError: (error: unknown) => {
              const err =
                error instanceof Error ? error : new Error(String(error));
              handleUIError(err);
              setImages((prevImages) =>
                prevImages.map((img) =>
                  img.id === image.id ? { ...img, status: 'error' } : img
                )
              );
            },
          }
        );
      } catch (error) {
        handleUIError(error);
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === image.id ? { ...img, status: 'error' } : img
          )
        );
      }
    }
  }, [images, selectedImageIds]);

  const handleDownloadResult = useCallback(
    (id: string) => {
      const image = allImages.find((img) => img.id === id);
      if (image && image.status === 'success' && image.uploadedFileUrl) {
        window.open(image.uploadedFileUrl, '_blank');
      } else {
        toast.error('ダウンロード可能なファイルがありません。');
      }
    },
    [allImages]
  );

  const handleRetryJob = useCallback(
    async (id: string) => {
      const image = allImages.find((img) => img.id === id);
      if (!image) return;

      // 実行済みJOBの場合は、同じパラメータで新しいJOBを作成
      if (image.jobId) {
        const jobParams = {
          watermarkText: image.settings.text,
          encodeMode: image.settings.encodeMode,
          jpegEmbedMode: image.settings.jpegEmbedMode,
          strength: image.settings.strength,
          blockSize: image.settings.blockSize,
          jpegQuality: image.settings.jpegQuality,
        };

        createJobMutation.mutate(
          {
            type: JOB_TYPE.EMBED,
            srcImagePath: image.uploadedFileUrl || '',
            payload: jobParams,
          },
          {
            onSuccess: () => {
              toast.success('ジョブをリトライしました。');
              queryClient.invalidateQueries({ queryKey: ['jobs', 'all'] });
            },
            onError: (error: unknown) => {
              const err =
                error instanceof Error ? error : new Error(String(error));
              handleUIError(err);
            },
          }
        );
      } else {
        // 未実行の画像の場合は、ステータスをidleに戻す
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === id ? { ...img, status: 'idle' } : img
          )
        );
        toast.info(
          'ジョブをリトライします。再度「透かし埋込を実行」ボタンを押してください。'
        );
      }
    },
    [allImages]
  );

  const selectedImages = images.filter((img) => selectedImageIds.has(img.id));
  const selectedImageCount = selectedImages.length;

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon">
            {/* <RefreshCw className="h-5 w-5" /> */}
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        <div className="grid h-full grid-cols-12">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 p-4">
            <ImageDropzone onDrop={handleDrop} />
            <div className="flex-grow rounded-lg border">
              <WatermarkTable
                images={allImages}
                selectedImageIds={selectedImageIds}
                onSelectionChange={setSelectedImageIds}
                onUpdateImageSettings={handleUpdateImageSettings}
                onRemoveImage={handleRemoveImage}
                // onEditRow={handleEditRow} // RowDrawer廃止に伴い削除
                onDownloadResult={handleDownloadResult}
                onRetryJob={handleRetryJob}
              />
            </div>
          </div>
          <aside className="col-span-12 lg:col-span-4 border-l bg-slate-50/50 p-4">
            <WatermarkParamForm
              key={Array.from(selectedImageIds).join('-')}
              initialSettings={defaultWatermarkSettings}
              onApply={handleApplyAllSettings}
              selectedCount={selectedImageCount}
              images={selectedImages}
            />
          </aside>
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleEncode}
          disabled={selectedImageCount === 0}
          size="lg"
        >
          Embed 選択 {selectedImageCount} 件
        </Button>
      </div>
    </div>
  );
};

export default WatermarkPage;
