'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface ImageDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onDrop }) => {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      'image/*': ['.jpeg', '.png', '.webp'],
    },
    maxFiles: 10,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
      ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <UploadCloud className="w-12 h-12 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-primary">Drop the files here ...</p>
        ) : (
          <p className="text-muted-foreground">
            Drag &apos;n&apos; drop some files here, or click to select files (up to 10)
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageDropzone;
