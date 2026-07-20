'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const SIZES = {
  sm: { icon: 'w-8 h-8', text: 'text-lg', gap: 'gap-2' },
  md: { icon: 'w-10 h-10', text: 'text-xl', gap: 'gap-2.5' },
  lg: { icon: 'w-14 h-14', text: 'text-2xl', gap: 'gap-3' },
  xl: { icon: 'w-20 h-20', text: 'text-4xl', gap: 'gap-4' },
};

export function Logo({ size = 'md', showText = true, animated = false, className = '' }: LogoProps) {
  const s = SIZES[size];

  const IconWrapper = animated ? motion.div : 'div';
  const iconProps = animated ? {
    whileHover: { rotate: 360, scale: 1.1 },
    transition: { duration: 0.6 }
  } : {};

  return (
    <div className={'flex items-center ' + s.gap + ' ' + className}>
      <IconWrapper
        {...iconProps}
        className={s.icon + ' relative rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30 overflow-hidden'}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-70" />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5 relative z-10"
        >
          <path
            d="M8 10L4 14L8 18"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 10L28 14L24 18"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 6L12 22"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="14" r="1.5" fill="white" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white animate-pulse" />
      </IconWrapper>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={s.text + ' font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight'}>
            DevFlow
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className="text-xs font-semibold text-muted-foreground tracking-widest mt-1">
              AI POWERED
            </span>
          )}
        </div>
      )}
    </div>
  );
}
