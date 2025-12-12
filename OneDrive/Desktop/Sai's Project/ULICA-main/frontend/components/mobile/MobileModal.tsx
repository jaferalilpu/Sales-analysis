'use client';

import React, { useEffect } from 'react';
import { XMarkIcon } from '@/components/ui/icons';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
}

/**
 * Mobile-optimized modal component
 * - Centered on desktop, full-screen on mobile
 * - Backdrop
 * - Smooth animations
 */
export function MobileModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnBackdrop = true,
}: MobileModalProps) {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    full: 'w-full h-full max-w-full',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          className={`
            bg-white rounded-2xl shadow-2xl
            ${sizeClasses[size]}
            ${size === 'full' ? 'rounded-none' : ''}
            transform transition-all duration-300
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            max-h-[90vh] overflow-hidden
            flex flex-col
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || typeof onClose === 'function') && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {typeof onClose === 'function' && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

