'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { UploadCloud, Trash2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

interface FileWithPreview extends File {
  preview: string;
  id: string;
}

export default function ImageUploader({ onFilesSelected }: ImageUploaderProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
        })
      );
      const combinedFiles = [...files, ...newFiles].slice(0, 10); // Limit to 10 files
      setFiles(combinedFiles);
      onFilesSelected(combinedFiles);
    },
    [files, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeFile = (fileToRemove: FileWithPreview) => {
    const newFiles = files.filter((file) => file !== fileToRemove);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    URL.revokeObjectURL(fileToRemove.preview); // Clean up memory
  };

  useEffect(() => {
    // Clean up preview URLs on component unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            {t(
              'imageUploader.dragAndDrop',
              "Drag 'n' drop files here, or click to select"
            )}
          </p>
          <Button type="button" variant="outline" size="sm">
            {t('imageUploader.selectFiles', 'Select Files')}
          </Button>
        </div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {t('imageUploader.selectedFiles', 'Selected Files')}
          </h4>
          <ul className="divide-y rounded-md border">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between p-2"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={file.preview}
                    alt={file.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div className="text-sm">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-muted-foreground">{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
