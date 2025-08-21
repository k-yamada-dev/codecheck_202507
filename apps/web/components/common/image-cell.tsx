'use client';

import { useQuery } from '@tanstack/react-query';
import { getSignedUrl } from '@/lib/gcs/getSignedUrl';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  path: string | null | undefined;
  alt: string;
  thumb?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ImageCell({ path, alt, thumb, onClick, className }: Props) {
  const {
    data: url,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['imageUrl', path],
    queryFn: () =>
      path ? getSignedUrl(path, { expiresInSec: 300 }) : Promise.resolve(null),
    enabled: !!path,
    staleTime: 1000 * 60 * 25,
    retry: 1,
  });

  if (isLoading)
    return <Skeleton className={thumb ? 'h-10 w-10' : 'h-40 w-40'} />;

  if (error || !url)
    return (
      <div
        className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs cursor-pointer"
        onClick={() => refetch()}
        aria-label="画像の取得に失敗しました"
      >
        N/A
      </div>
    );

  return (
    <Image
      src={url}
      alt={alt}
      fill={!thumb}
      width={thumb ? 40 : undefined}
      height={thumb ? 40 : undefined}
      className={`object-cover ${className ?? ''}`}
      onClick={onClick}
      priority={thumb}
    />
  );
}
