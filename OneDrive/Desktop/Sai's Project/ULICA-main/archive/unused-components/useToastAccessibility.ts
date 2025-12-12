import { useEffect } from 'react';
import { setupKeyboardAccessibility, setupReducedMotion } from '@/lib/toast';

/**
 * Hook to initialize toast accessibility features
 * - Keyboard navigation (ESC to dismiss all toasts)
 * - Reduced motion support for users with motion sensitivity
 */
export const useToastAccessibility = () => {
  useEffect(() => {
    // Setup keyboard accessibility
    const cleanupKeyboard = setupKeyboardAccessibility();
    
    // Setup reduced motion support
    const cleanupMotion = setupReducedMotion();

    // Cleanup on unmount
    return () => {
      if (cleanupKeyboard) cleanupKeyboard();
      if (cleanupMotion) cleanupMotion();
    };
  }, []);
};

export default useToastAccessibility;
