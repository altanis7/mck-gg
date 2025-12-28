'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { forwardRef, useState } from 'react';

export interface ChampionAvatarProps {
  championName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'blue' | 'red';
  shape?: 'square' | 'circle';
  className?: string;
  showTooltip?: boolean;
}

export const ChampionAvatar = forwardRef<HTMLDivElement, ChampionAvatarProps>(
  (
    {
      championName,
      size = 'md',
      variant = 'default',
      shape = 'square',
      className,
      showTooltip = false,
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const imagePath = `/champ/${championName}.webp`;

    // Fallback: 챔피언 첫 글자 표시
    if (imageError) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center bg-gray-200 text-gray-700 font-semibold',
            // Size variants
            {
              'w-6 h-6 text-xs': size === 'xs',
              'w-8 h-8 text-sm': size === 'sm',
              'w-10 h-10 text-base': size === 'md',
              'w-12 h-12 text-lg': size === 'lg',
            },
            // Shape: rounded square or circle
            shape === 'circle' ? 'rounded-full' : 'rounded-md',
            // Border variants
            {
              'ring-2 ring-blue-400': variant === 'blue',
              'ring-2 ring-red-400': variant === 'red',
            },
            className
          )}
          title={showTooltip ? championName : undefined}
        >
          {championName.charAt(0)}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-block overflow-hidden',
          // Size variants
          {
            'w-6 h-6': size === 'xs',
            'w-8 h-8': size === 'sm',
            'w-10 h-10': size === 'md',
            'w-12 h-12': size === 'lg',
          },
          // Shape: rounded square or circle
          shape === 'circle' ? 'rounded-full' : 'rounded-md',
          // Border variants
          {
            'ring-2 ring-blue-400': variant === 'blue',
            'ring-2 ring-red-400': variant === 'red',
          },
          className
        )}
        title={showTooltip ? championName : undefined}
      >
        <Image
          src={imagePath}
          alt={championName}
          fill
          sizes={
            size === 'xs'
              ? '24px'
              : size === 'sm'
                ? '32px'
                : size === 'md'
                  ? '40px'
                  : '48px'
          }
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
);

ChampionAvatar.displayName = 'ChampionAvatar';
