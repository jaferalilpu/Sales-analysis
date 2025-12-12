'use client';

import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback(
    (opts: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions(opts);
        setOnConfirmCallback(() => async () => {
          setIsOpen(false);
          resolve(true);
        });
        setIsOpen(true);
      });
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    if (onConfirmCallback) {
      setIsLoading(true);
      try {
        await onConfirmCallback();
        setIsOpen(false);
      } catch (error) {
        console.error('Confirmation action failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onConfirmCallback]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, []);

  return {
    isOpen,
    options,
    isLoading,
    confirm,
    handleConfirm,
    handleClose,
  };
}

