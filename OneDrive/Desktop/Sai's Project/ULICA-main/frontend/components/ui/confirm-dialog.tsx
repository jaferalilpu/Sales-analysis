'use client';

import { Fragment } from 'react';
import { XIcon, ExclamationTriangleIcon } from '@/components/ui/icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: 'text-red-600',
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      icon: 'text-yellow-600',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      icon: 'text-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700">
            <ExclamationTriangleIcon className={`h-6 w-6 ${styles.icon}`} aria-hidden="true" />
          </div>

          {/* Title */}
          <h3
            id="modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2"
          >
            {title}
          </h3>

          {/* Message */}
          <p
            id="modal-description"
            className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.button}`}
              aria-label={confirmText}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

