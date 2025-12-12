'use client';

import { useToastAccessibility } from '@/hooks/useToastAccessibility';

/**
 * Client component to initialize toast accessibility features
 * This must be a client component since it uses browser APIs
 */
export const ToastAccessibility = () => {
  useToastAccessibility();
  return null; // This component doesn't render anything
};

export default ToastAccessibility;
