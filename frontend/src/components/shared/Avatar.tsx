'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-32 h-32 text-3xl',
};

const STATUS_SIZES = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-6 h-6',
};

const STATUS_COLORS = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export function Avatar({
  name = 'User',
  src,
  size = 'md',
  className,
  showStatus = false,
  status = 'online',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = src && !imageError && src.length > 5;

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-bold overflow-hidden',
          SIZES[size],
          !hasImage && 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
        )}
      >
        {hasImage ? (
          <img
            src={src!}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white dark:border-slate-950',
            STATUS_SIZES[size],
            STATUS_COLORS[status]
          )}
        />
      )}
    </div>
  );
}