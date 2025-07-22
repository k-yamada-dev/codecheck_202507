'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader from '../components/ImageUploader';
import { UploadCloud } from 'lucide-react';

// Dummy data
const dummyImages = [
  { id: 1, name: 'image_01.jpg', size: '1.2 MB', uploadedAt: '2023/10/27 10:00' },
  { id: 2, name: 'photo_A.png', size: '3.4 MB', uploadedAt: '2023/10/27 11:30' },
  { id: 3, name: 'document.webp', size: '850 KB', uploadedAt: '2023/10/26 15:45' },
];

export default function ImageManagementPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setFilesToUpload(files);
  };

  const handleUpload = () => {
    console.log('Uploading files:', filesToUpload);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              {t('imageManagement.uploadButton', 'Upload Image')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t('imageManagement.uploadModalTitle', 'Upload New Image')}</DialogTitle>
              <DialogDescription>
                {t('imageManagement.uploadModalDescription', 'Select images to upload.')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ImageUploader onFilesSelected={handleFilesSelected} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleUpload} disabled={filesToUpload.length === 0}>
                {t('common.upload', 'Upload')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('imageManagement.table.fileName', 'File Name')}</TableHead>
                <TableHead>{t('imageManagement.table.fileSize', 'Size')}</TableHead>
                <TableHead>{t('imageManagement.table.uploadedAt', 'Uploaded At')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyImages.map(image => (
                <TableRow key={image.id}>
                  <TableCell className="font-medium">{image.name}</TableCell>
                  <TableCell>{image.size}</TableCell>
                  <TableCell>{image.uploadedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
