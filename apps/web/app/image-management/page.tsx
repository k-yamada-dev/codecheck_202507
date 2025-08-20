'use client';

import { ImageDataTable } from '@/components/ImageDataTable';
import { useTranslation } from 'react-i18next';

export default function ImageManagementPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('imageManagement.title')}</h1>
      <ImageDataTable />
    </div>
  );
}
