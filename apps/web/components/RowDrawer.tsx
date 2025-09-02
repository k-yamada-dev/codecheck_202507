'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { WatermarkParamForm } from '@/components/WatermarkParamForm';
import Image from 'next/image';
import { WatermarkImage, WatermarkSettings } from '@/components/WatermarkTable';

interface RowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, settings: WatermarkSettings) => void;
  image: WatermarkImage | null;
}

const RowDrawer: React.FC<RowDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  image,
}) => {
  const [currentSettings, setCurrentSettings] =
    useState<WatermarkSettings | null>(null);

  useEffect(() => {
    if (image) {
      setCurrentSettings(image.settings);
    }
  }, [image]);

  const handleApply = useCallback(
    (settings: Partial<WatermarkSettings>) => {
      if (image && currentSettings) {
        const newSettings = { ...currentSettings, ...settings };
        setCurrentSettings(newSettings);
      }
    },
    [image, currentSettings]
  );

  const handleSave = () => {
    if (image && currentSettings) {
      onSave(image.id, currentSettings);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[320px] sm:w-[420px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>画像詳細・個別設定</SheetTitle>
          <SheetDescription>
            {image ? `ファイル: ${image.file.name}` : '画像を選択してください'}
          </SheetDescription>
        </SheetHeader>
        {image && currentSettings && (
          <div className="flex-grow overflow-y-auto py-4">
            <div className="mb-4 text-center">
              <Image
                src={image.previewUrl}
                alt={image.file.name}
                width={128}
                height={128}
                className="rounded-md object-cover mx-auto"
              />
            </div>
            <WatermarkParamForm
              initialSettings={currentSettings}
              onApply={handleApply}
              selectedCount={1}
              images={[image]}
            />
          </div>
        )}
        <div className="mt-auto py-4 border-t">
          <Button className="w-full" onClick={handleSave} disabled={!image}>
            保存
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RowDrawer;
