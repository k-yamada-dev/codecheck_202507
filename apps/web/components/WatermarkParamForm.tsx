'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  WatermarkSettings,
  WatermarkImage,
  EncodeMode,
  JpegEmbedMode,
  BlockSize,
} from '@/components/WatermarkTable';

export interface WatermarkParamFormProps {
  initialSettings: WatermarkSettings;
  onApply: (
    settings: Partial<WatermarkSettings> & { autoIncrement?: boolean }
  ) => void;
  selectedCount: number;
  images: WatermarkImage[];
}

export const WatermarkParamForm: React.FC<WatermarkParamFormProps> = ({
  initialSettings,
  onApply,
  selectedCount,
  images,
}) => {
  const [settings, setSettings] =
    useState<Partial<WatermarkSettings>>(initialSettings);
  const [isChanged, setIsChanged] = useState(false);
  const [autoIncrement, setAutoIncrement] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
    setIsChanged(false);
    setAutoIncrement(false); // Reset autoIncrement when initialSettings change
  }, [initialSettings, selectedCount]);

  const isTextValid = (text: string) => {
    const encoder = new TextEncoder();
    return encoder.encode(text).length <= 192; // UTF-8バイト長 < 192
  };

  const handleValueChange = (
    key: keyof WatermarkSettings,
    value: WatermarkSettings[keyof WatermarkSettings]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsChanged(true);
  };

  const handleApplyClick = () => {
    onApply({ ...settings, autoIncrement });
    setIsChanged(false);
  };

  const handleResetClick = () => {
    setSettings(initialSettings);
    setIsChanged(false);
    setAutoIncrement(false);
  };

  const baseText = settings.text || '';
  const isApplyDisabled =
    !isChanged || selectedCount === 0 || !isTextValid(baseText);

  if (autoIncrement) {
    // 連番付与時の最大文字数チェック
    const maxLenExceeded = images.some((_, index) => {
      const textWithSuffix = `${baseText}_${index + 1}`;
      return !isTextValid(textWithSuffix);
    });
    if (maxLenExceeded) {
      // エラー表示は別途行うか、Applyボタンを無効化する
      // ここではApplyボタンを無効化する
      // isApplyDisabled = true; // これは直接変更できないので、JSXで条件を追加
    }
  }

  const hasJpeg = images.some((img) => img.file.type === 'image/jpeg');

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">一括設定</h3>
        <Badge variant="secondary">{selectedCount} files selected</Badge>
      </div>
      <div
        className={`flex-grow p-4 space-y-6 overflow-y-auto ${selectedCount === 0 ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div>
          <Label htmlFor="watermark-text">透かし情報</Label>
          <Input
            id="watermark-text"
            placeholder="例: ACUA-2025"
            value={settings.text || ''}
            onChange={(e) => handleValueChange('text', e.target.value)}
            maxLength={64}
          />
          {!isTextValid(baseText) && (
            <p className="text-red-500 text-sm mt-1">
              透かし情報は192バイト（UTF-8）以内である必要があります。
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-increment"
            checked={autoIncrement}
            onCheckedChange={(checked) => setAutoIncrement(!!checked)}
          />
          <Label htmlFor="auto-increment">行ごとに _1, _2, ... を付与</Label>
        </div>
        <div>
          <Label>エンコードモード</Label>
          <Select
            value={settings.encodeMode}
            onValueChange={(value: EncodeMode) =>
              handleValueChange('encodeMode', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選択..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="通常">通常</SelectItem>
              <SelectItem value="オプション">オプション</SelectItem>
              <SelectItem value="更新">更新</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasJpeg && (
          <div>
            <Label>JPEG 埋込モード</Label>
            <Select
              value={settings.jpegEmbedMode}
              onValueChange={(value: JpegEmbedMode) =>
                handleValueChange('jpegEmbedMode', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="通常">通常</SelectItem>
                <SelectItem value="高速">高速</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label>透かし強度</Label>
          <RadioGroup
            value={String(settings.strength)}
            onValueChange={(value) =>
              handleValueChange('strength', Number(value))
            }
            className="flex space-x-2"
          >
            {[1, 2, 3, 4, 5].map((val) => (
              <div key={val} className="flex items-center space-x-1">
                <RadioGroupItem value={String(val)} id={`strength-${val}`} />
                <Label htmlFor={`strength-${val}`}>{val}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label>ブロックサイズ</Label>
          <Select
            value={settings.blockSize}
            onValueChange={(value: BlockSize) =>
              handleValueChange('blockSize', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選択..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="自動設定">自動設定</SelectItem>
              <SelectItem value="128ブロック">128ブロック</SelectItem>
              <SelectItem value="256ブロック">256ブロック</SelectItem>
              <SelectItem value="512ブロック">512ブロック</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasJpeg && (
          <div>
            <Label>JPEG 品質 (%) - {settings.jpegQuality}</Label>
            <Slider
              value={[settings.jpegQuality || 90]}
              onValueChange={([value]) =>
                handleValueChange('jpegQuality', value)
              }
              min={1}
              max={100}
              step={1}
            />
          </div>
        )}
      </div>
      <div className="p-4 border-t mt-auto">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleResetClick}>
            Reset
          </Button>
          <Button
            onClick={handleApplyClick}
            disabled={
              isApplyDisabled ||
              (autoIncrement &&
                images.some(
                  (_, index) => !isTextValid(`${baseText}_${index + 1}`)
                ))
            }
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
