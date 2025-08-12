'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleUIError } from '@/lib/errors/uiHandler';
import { uploadFile } from '@/lib/gcs/upload.client';
import { useJobsCreateJob } from '@/__generated__/hooks/';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface DecodeFormProps {
  onSuccess?: (jobId: string) => void;
}

interface FormData {
  files: File[];
  blockSize: number;
  timer: number;
  widthScalingFrom: number;
  widthScalingTo: number;
  heightScalingFrom: number;
  heightScalingTo: number;
  rotationFrom: number;
  rotationTo: number;
}

export const DecodeForm: React.FC<DecodeFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const decodeMutation = useJobsCreateJob();
  const [formData, setFormData] = useState<FormData>({
    files: [],
    blockSize: 8,
    timer: 60,
    widthScalingFrom: 90,
    widthScalingTo: 110,
    heightScalingFrom: 90,
    heightScalingTo: 110,
    rotationFrom: -5,
    rotationTo: 5,
  });

  const handleFilesSelected = (files: File[]) => {
    setFormData({ ...formData, files });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.files.length === 0) {
        throw new Error(t('decode.errors.noFile'));
      }
      const fileToUpload = formData.files[0];

      const { filePath } = await uploadFile<{ filePath: string }>(fileToUpload);

      const result = await decodeMutation.mutateAsync({
        body: {
          type: 'DECODE',
          srcImagePath: filePath,
          params: {
            blockSize: formData.blockSize,
            timer: formData.timer,
            widthScalingFrom: formData.widthScalingFrom,
            widthScalingTo: formData.widthScalingTo,
            heightScalingFrom: formData.heightScalingFrom,
            heightScalingTo: formData.heightScalingTo,
            rotationFrom: formData.rotationFrom,
            rotationTo: formData.rotationTo,
            logfile: `decode_${Date.now()}.log`,
          },
        },
      });

      onSuccess?.(result.id || '');
    } catch (error) {
      handleUIError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('decode.title', 'Decode Image')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>{t('decode.imageUpload', 'Upload Image')}</Label>
            <ImageUploader onFilesSelected={handleFilesSelected} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blockSize">{t('decode.blockSize', 'Block Size')}</Label>
              <Input
                id="blockSize"
                name="blockSize"
                type="number"
                value={formData.blockSize}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="timer">{t('decode.timer', 'Timer (sec)')}</Label>
              <Input
                id="timer"
                name="timer"
                type="number"
                value={formData.timer}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="widthScalingFrom">
                {t('decode.widthScalingFrom', 'Width Scaling From')}
              </Label>
              <Input
                id="widthScalingFrom"
                name="widthScalingFrom"
                type="number"
                value={formData.widthScalingFrom}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="widthScalingTo">
                {t('decode.widthScalingTo', 'Width Scaling To')}
              </Label>
              <Input
                id="widthScalingTo"
                name="widthScalingTo"
                type="number"
                value={formData.widthScalingTo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heightScalingFrom">
                {t('decode.heightScalingFrom', 'Height Scaling From')}
              </Label>
              <Input
                id="heightScalingFrom"
                name="heightScalingFrom"
                type="number"
                value={formData.heightScalingFrom}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="heightScalingTo">
                {t('decode.heightScalingTo', 'Height Scaling To')}
              </Label>
              <Input
                id="heightScalingTo"
                name="heightScalingTo"
                type="number"
                value={formData.heightScalingTo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rotationFrom">{t('decode.rotationFrom', 'Rotation From')}</Label>
              <Input
                id="rotationFrom"
                name="rotationFrom"
                type="number"
                value={formData.rotationFrom}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="rotationTo">{t('decode.rotationTo', 'Rotation To')}</Label>
              <Input
                id="rotationTo"
                name="rotationTo"
                type="number"
                value={formData.rotationTo}
                onChange={handleInputChange}
              />
            </div>
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
            disabled={loading || formData.files.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('decode.submit', 'Decode')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
