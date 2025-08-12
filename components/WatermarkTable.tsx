'use client';

import React from 'react';
import { DataTable } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSignedUrl } from '@/hooks/useSignedUrl';

export type EncodeMode = '通常' | 'オプション' | '更新';
export type JpegEmbedMode = '通常' | '高速';
export type BlockSize = '自動設定' | '128ブロック' | '256ブロック' | '512ブロック';

export interface WatermarkSettings {
  text: string;
  encodeMode: EncodeMode;
  jpegEmbedMode: JpegEmbedMode;
  strength: number;
  blockSize: BlockSize;
  jpegQuality: number;
  autoIncrement?: boolean;
}

export interface WatermarkImage {
  id: string;
  file: File;
  previewUrl: string;
  settings: WatermarkSettings;
  status: 'idle' | 'pending' | 'running' | 'success' | 'error' | 'uploading';
  jobId?: string;
  uploadedFileUrl?: string; // This will be the GCS path after upload
  thumbnailPath?: string; // This will be the GCS thumbnail path after upload
  isUploaded?: boolean; // GCSに存在する場合true
}

interface WatermarkTableProps {
  images: WatermarkImage[];
  selectedImageIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onUpdateImageSettings: (id: string, settings: Partial<WatermarkSettings>) => void;
  onRemoveImage: (id: string) => void;
  onDownloadResult?: (id: string) => void;
  onRetryJob?: (id: string) => void;
}

const ThumbnailCell: React.FC<{ image: WatermarkImage }> = ({ image }) => {
  // useSignedUrlは常に呼び出す（React Hooksルール対応）
  const { data: signedUrl, isLoading, error } = useSignedUrl(image.thumbnailPath ?? '');
  // isUploadedがtrueならGCS、falseならローカル
  if (image.isUploaded && image.thumbnailPath) {
    return (
      <div className="relative flex h-16 w-16 items-center justify-center">
        {isLoading ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
            <ImageIcon className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        ) : error || !signedUrl ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-red-100">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        ) : (
          <Image
            src={signedUrl}
            alt={image.file.name}
            width={64}
            height={64}
            className="rounded-md object-cover"
            unoptimized={true}
          />
        )}
        {image.status === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
        {image.status === 'running' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <Progress value={50} className="w-[80%]" />
          </div>
        )}
        {image.status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-green-900/70">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
        )}
        {image.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-900/70">
            <XCircle className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    );
  } else {
    // ローカル画像
    return (
      <div className="relative flex h-16 w-16 items-center justify-center">
        {!image.previewUrl ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
            <ImageIcon className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        ) : (
          <Image
            src={image.previewUrl}
            alt={image.file.name}
            width={64}
            height={64}
            className="rounded-md object-cover"
            unoptimized={true}
          />
        )}
        {image.status === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
        {image.status === 'running' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
            <Progress value={50} className="w-[80%]" />
          </div>
        )}
        {image.status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-green-900/70">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
        )}
        {image.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-900/70">
            <XCircle className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    );
  }
};

const WatermarkTable: React.FC<WatermarkTableProps> = ({
  images,
  selectedImageIds,
  onSelectionChange,
  onUpdateImageSettings,
  onRemoveImage,
  onDownloadResult,
  onRetryJob,
}) => {
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    const newSelectedIds = new Set<string>();
    if (checked === true) {
      images.forEach(img => newSelectedIds.add(img.id));
    }
    onSelectionChange(newSelectedIds);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedImageIds);
    if (checked) {
      newSelectedIds.add(id);
    } else {
      newSelectedIds.delete(id);
    }
    onSelectionChange(newSelectedIds);
  };

  return (
    <TooltipProvider>
      <DataTable
        data={images}
        columns={[
          {
            header: (
              <Checkbox
                checked={
                  selectedImageIds.size > 0 && selectedImageIds.size === images.length
                    ? true
                    : selectedImageIds.size > 0
                      ? 'indeterminate'
                      : false
                }
                onCheckedChange={checked => handleSelectAll(!!checked)}
              />
            ),
            accessor: image => (
              <Checkbox
                checked={selectedImageIds.has(image.id)}
                onCheckedChange={checked => handleSelectRow(image.id, !!checked)}
              />
            ),
            width: '40px',
          },
          {
            header: 'Thumb',
            accessor: image => <ThumbnailCell image={image} />,
            width: '64px',
          },
          {
            header: 'FileName',
            accessor: image => image.file.name,
            width: '22%',
          },
          {
            header: 'Text',
            accessor: image => (
              <Input
                value={image.settings.text}
                onChange={e => onUpdateImageSettings(image.id, { text: e.target.value })}
                className="w-full"
              />
            ),
            width: '28%',
          },
          {
            header: 'Block Size',
            accessor: image => (
              <Select
                value={image.settings.blockSize}
                onValueChange={(value: BlockSize) =>
                  onUpdateImageSettings(image.id, { blockSize: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="自動設定">Auto</SelectItem>
                  <SelectItem value="128ブロック">128</SelectItem>
                  <SelectItem value="256ブロック">256</SelectItem>
                  <SelectItem value="512ブロック">512</SelectItem>
                </SelectContent>
              </Select>
            ),
            width: '8%',
          },
          {
            header: 'JPEG Mode',
            accessor: image => (
              <Select
                value={image.settings.jpegEmbedMode}
                onValueChange={(value: JpegEmbedMode) =>
                  onUpdateImageSettings(image.id, { jpegEmbedMode: value })
                }
                disabled={!image.file.type.includes('jpeg')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="通常">通常</SelectItem>
                  <SelectItem value="高速">高速</SelectItem>
                </SelectContent>
              </Select>
            ),
            width: '8%',
          },
          {
            header: 'JPEG Quality',
            accessor: image => (
              <Input
                type="number"
                value={image.settings.jpegQuality}
                onChange={e =>
                  onUpdateImageSettings(image.id, { jpegQuality: Number(e.target.value) })
                }
                className="w-full"
                min={1}
                max={100}
                disabled={!image.file.type.includes('jpeg')}
              />
            ),
            width: '8%',
          },
          {
            header: 'Strength',
            accessor: image => image.settings.strength,
            width: '8%',
          },
          {
            header: 'Mode',
            accessor: image => image.settings.encodeMode,
            width: '8%',
          },
        ]}
        actions={image => [
          {
            label: 'Download',
            onClick: () => onDownloadResult?.(image.id),
            disabled: image.status !== 'success',
          },
          {
            label: 'Retry',
            onClick: () => onRetryJob?.(image.id),
            disabled: image.status !== 'error',
          },
          {
            label: 'Delete',
            onClick: () => onRemoveImage(image.id),
          },
        ]}
      />
    </TooltipProvider>
  );
};

export default WatermarkTable;
