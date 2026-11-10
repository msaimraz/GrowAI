'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { PlantCategoryIcon } from '@/components/plants/PlantCategoryIcon';

export interface PlantImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2' | 'portrait' | 'auto';
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  fallbackIcon?: React.ReactNode;
}

export function PlantImage({
  src,
  alt,
  category = 'herbs-greens',
  aspectRatio = '4/3',
  fill = true,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className = '',
  imageClassName = '',
  objectPosition = 'center',
  fallbackIcon,
}: PlantImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Aspect ratio styling
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
      ? 'aspect-4/3'
      : aspectRatio === '16/9'
      ? 'aspect-video'
      : aspectRatio === '3/2'
      ? 'aspect-3/2'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : '';

  const showFallback = !src || hasError;

  if (showFallback) {
    return (
      <div
        className={`w-full h-full min-h-[140px] flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F0E3] to-[#FFF0D8] p-4 text-center select-none ${aspectClass} ${className}`}
        role="img"
        aria-label={`${alt} (Botanical Illustration)`}
      >
        <span className="w-12 h-12 rounded-2xl bg-white/85 border border-[#CEE4C9] flex items-center justify-center text-[#174C35] mb-2 shadow-xs transition-transform group-hover:scale-105">
          {fallbackIcon || <PlantCategoryIcon category={category} size={24} />}
        </span>
        <span className="text-xs font-mono text-[#68736B] uppercase tracking-wider">
          {category.replace('-', ' ')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#F3F6EC] ${
        fill ? aspectClass : ''
      } ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#EFEAE0] via-[#F8F5EE] to-[#EFEAE0] animate-pulse z-0"
        />
      )}

      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectPosition }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`object-cover transition-all duration-300 ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } ${imageClassName}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 300}
          sizes={sizes}
          priority={priority}
          style={{ objectPosition }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`object-cover transition-all duration-300 ${
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } ${imageClassName}`}
        />
      )}
    </div>
  );
}

