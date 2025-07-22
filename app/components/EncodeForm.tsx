'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { errorLogger } from '../utils/errorLogging';
import ImageUploader from './ImageUploader'; // This will be replaced later
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { createJob } from '@/lib/api/jobs';
import { JobType } from '@prisma/client';

interface EncodeFormProps {
  onSuccess?: (outputUrl: string) => void;
}

interface FormData {
  files: File[];
  watermark: string;
  strength: number;
  blockSize: number;
  mode: string;
  enmode: string;
  quality: number;
}

export const EncodeForm: React.FC<EncodeFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    files: [],
    watermark: '',
    strength: 50,
    blockSize: 8,
    mode: 'normal',
    enmode: 'standard',
    quality: 90,
  });

  const handleFilesSelected = (files: File[]) => {
    setFormData({ ...formData, files });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.files.length === 0) {
        throw new Error(t('encode.errors.noFile'));
      }
      const fileToUpload = formData.files[0];
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileToUpload);

      const uploadResponse = await fetch('/api/v1/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      if (!uploadResponse.ok) throw new Error(t('encode.errors.uploadFailed'));
      const { filePath, thumbnailPath } = await uploadResponse.json();

      const params = {
        watermark_text: formData.watermark,
        strength: formData.strength,
        blockSize: formData.blockSize,
        mode: formData.mode,
        enmode: formData.enmode,
        quality: formData.quality,
      };

      const newJob = await createJob({
        type: JobType.EMBED,
        srcImagePath: filePath,
        thumbnailPath: thumbnailPath,
        params,
      });

      // Note: In a real-world scenario, you would likely poll the job status
      // or use WebSockets to get the result. For now, we assume success.
      onSuccess?.(newJob.id); // Passing job ID for now
    } catch (error) {
      const message = error instanceof Error ? error.message : t('encode.errors.unknown');
      setError(message);
      errorLogger.logError(error instanceof Error ? error : new Error(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('encode.title', 'Encode Image')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>{t('encode.imageUpload', 'Upload Image')}</Label>
            <ImageUploader onFilesSelected={handleFilesSelected} />
          </div>

          <div>
            <Label htmlFor="watermark">{t('encode.watermark', 'Watermark')}</Label>
            <Input
              id="watermark"
              name="watermark"
              value={formData.watermark}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strength">{t('encode.strength', 'Strength')}</Label>
              <Input
                id="strength"
                name="strength"
                type="number"
                value={formData.strength}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="blockSize">{t('encode.blockSize', 'Block Size')}</Label>
              <Input
                id="blockSize"
                name="blockSize"
                type="number"
                value={formData.blockSize}
                onChange={handleInputChange}
                min="4"
                max="16"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('encode.mode', 'Mode')}</Label>
              <Select name="mode" value={formData.mode} onValueChange={handleSelectChange('mode')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t('encode.modes.normal', 'Normal')}</SelectItem>
                  <SelectItem value="fast">{t('encode.modes.fast', 'Fast')}</SelectItem>
                  <SelectItem value="quality">{t('encode.modes.quality', 'Quality')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('encode.enmode', 'Enmode')}</Label>
              <Select
                name="enmode"
                value={formData.enmode}
                onValueChange={handleSelectChange('enmode')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an enmode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    {t('encode.enmodes.standard', 'Standard')}
                  </SelectItem>
                  <SelectItem value="enhanced">
                    {t('encode.enmodes.enhanced', 'Enhanced')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="quality">{t('encode.quality', 'Quality')}</Label>
            <Input
              id="quality"
              name="quality"
              type="number"
              value={formData.quality}
              onChange={handleInputChange}
              min="0"
              max="100"
            />
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
            disabled={loading || formData.files.length === 0 || !formData.watermark}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('encode.submit', 'Encode')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
