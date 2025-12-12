'use client';

import React from 'react';
import { useTouchFeedback } from '@/hooks/useTouch';

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Mobile-optimized card component
 * - Touch-friendly
 * - Proper spacing
 * - Accessible
 */
export function MobileCard({
  children,
  onClick,
  className = '',
  hoverable = false,
  padding = 'md',
}: MobileCardProps) {
  const { isPressed, handlers } = useTouchFeedback();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200';
  const interactiveClasses = onClick || hoverable
    ? 'cursor-pointer transition-all duration-200 active:scale-[0.98]'
    : '';
  const hoverClasses = hoverable && !isPressed
    ? 'hover:shadow-md hover:border-gray-300'
    : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${interactiveClasses}
        ${hoverClasses}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
      {...(onClick ? handlers : {})}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

