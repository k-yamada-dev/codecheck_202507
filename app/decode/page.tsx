'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import ImageUploader from '../components/ImageUploader'; // ImageUploaderを再利用
import { apiClient } from '../utils/apiClient';
import { createJob } from '@/lib/api/jobs';
import { Job, JobType, JobStatus } from '@prisma/client'; // PrismaのJob型をインポート
import { toast } from 'sonner';

// 仮のジョブ型定義をPrismaのJob型に置き換え
interface DecodeJob extends Job {
  inputFileName: string; // UI表示用にファイル名/URLを保持
  detectedText?: string;
  confidence?: number;
}

// DecodeInputAreaの仮実装
const DecodeInputArea: React.FC<{ onJobSubmit: (job: DecodeJob) => void }> = ({ onJobSubmit }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setUrl(''); // ファイルが選択されたらURLをクリア
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (files.length === 0 && !url) {
        throw new Error(t('decode.errors.noFileOrUrl'));
      }

      let uploadedFileUrl: string;
      if (files.length > 0) {
        // ファイルアップロード
        const uploadResponse = await apiClient.uploadFile(files[0]);
        if (!uploadResponse.data || !uploadResponse.data.fileUrl) {
          throw new Error(uploadResponse.error || 'ファイルのアップロードに失敗しました。');
        }
        uploadedFileUrl = uploadResponse.data.fileUrl;
      } else if (url) {
        uploadedFileUrl = url;
      } else {
        throw new Error(t('decode.errors.noFileOrUrl'));
      }

      const newJob = await createJob({
        type: JobType.DECODE,
        srcImagePath: uploadedFileUrl,
        params: {
          // デコード固有のパラメータがあればここに追加
          // 例: decodeMode: '通常',
        },
      });

      // ジョブが作成されたことをUIに反映
      onJobSubmit({
        ...newJob,
        inputFileName: files.length > 0 ? files[0].name : url, // UI表示用にファイル名/URLを保持
        detectedText: undefined,
        confidence: undefined,
      });
      toast.success(
        `${files.length > 0 ? files[0].name : url} の透かし検出ジョブが開始されました。`
      );
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('decode.errors.unknown');
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="imageUrl">{t('decode.imageUrl', 'Image URL')}</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="text"
              value={url}
              onChange={e => {
                setUrl(e.target.value);
                setFiles([]); // URLが入力されたらファイルをクリア
              }}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="text-center text-gray-500">{t('imageUploader.or', 'or')}</div>
          <div>
            <Label>{t('decode.imageUpload', 'Upload Image')}</Label>
            <ImageUploader onFilesSelected={handleFilesSelected} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (files.length === 0 && !url)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('decode.submit', 'Detect Watermark')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// DecodeJobTableの仮実装
const DecodeJobTable: React.FC<{ jobs: DecodeJob[] }> = ({ jobs }) => {
  const { t } = useTranslation();

  if (jobs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t(
          'decode.noJobs',
          'No detection jobs yet. Start by uploading an image or entering a URL.'
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('decode.recentJobs', 'Recent Detection Jobs')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('job.table.id', 'JOB ID')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('job.table.status', 'Status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('decode.table.input', 'Input')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('decode.table.detectedText', 'Detected Text')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('decode.table.confidence', 'Confidence')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('job.table.createdAt', 'Created At')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map(job => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.inputFileName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.detectedText || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.confidence !== undefined ? `${job.confidence}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DecodePage() {
  const [jobs, setJobs] = useState<DecodeJob[]>([]);

  const handleJobSubmit = (newOrUpdatedJob: DecodeJob) => {
    setJobs(prevJobs => {
      const existingJobIndex = prevJobs.findIndex(job => job.id === newOrUpdatedJob.id);
      if (existingJobIndex > -1) {
        // 既存のジョブを更新
        const updatedJobs = [...prevJobs];
        updatedJobs[existingJobIndex] = newOrUpdatedJob;
        return updatedJobs;
      } else {
        // 新しいジョブを追加
        return [newOrUpdatedJob, ...prevJobs];
      }
    });
  };

  return (
    <div className="space-y-6 p-6">
      <DecodeInputArea onJobSubmit={handleJobSubmit} />
      <DecodeJobTable jobs={jobs} />
    </div>
  );
}
