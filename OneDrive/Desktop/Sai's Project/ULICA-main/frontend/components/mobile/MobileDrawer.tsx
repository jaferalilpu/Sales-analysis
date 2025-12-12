'use client';

import React, { useEffect } from 'react';
import { XMarkIcon } from '@/components/ui/icons';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Mobile-optimized drawer component
 * - Swipe to close
 * - Backdrop
 * - Smooth animations
 */
export function MobileDrawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right',
  size = 'md',
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    bottom: 'bottom-0 left-0 right-0',
  };

  const sizeClasses = {
    sm: position === 'bottom' ? 'max-h-[40vh]' : 'w-80',
    md: position === 'bottom' ? 'max-h-[60vh]' : 'w-96',
    lg: position === 'bottom' ? 'max-h-[80vh]' : 'w-[28rem]',
    full: position === 'bottom' ? 'max-h-[95vh]' : 'w-full',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed z-50 bg-white shadow-2xl
          ${positionClasses[position]}
          ${sizeClasses[size]}
          ${position === 'bottom' ? 'rounded-t-2xl' : ''}
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0 translate-y-0' : position === 'right' ? 'translate-x-full' : position === 'left' ? '-translate-x-full' : 'translate-y-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Header */}
        {(title || typeof onClose === 'function') && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {typeof onClose === 'function' && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
                aria-label="Close drawer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}

