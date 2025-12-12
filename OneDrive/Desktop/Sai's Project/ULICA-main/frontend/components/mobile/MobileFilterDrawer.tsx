'use client';

import React from 'react';
import { MobileDrawer } from './MobileDrawer';
import { FunnelIcon, XMarkIcon } from '@/components/ui/icons';

interface FilterOption {
  value: string;
  label: string;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  onApply?: () => void;
  onReset?: () => void;
}

/**
 * Mobile-optimized filter drawer
 * - Full-screen on mobile
 * - Easy to apply/reset filters
 */
export function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
  title = 'Filters',
  onApply,
  onReset,
}: MobileFilterDrawerProps) {
  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      size="full"
      title={title}
    >
      <div className="flex flex-col h-full">
        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors touch-target"
            >
              Reset
            </button>
          )}
          {onApply && (
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors touch-target"
            >
              Apply Filters
            </button>
          )}
        </div>
      </div>
    </MobileDrawer>
  );
}

