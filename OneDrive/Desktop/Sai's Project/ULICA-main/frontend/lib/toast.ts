import toast from 'react-hot-toast';

// Debounce utility for rapid actions
const debounceMap = new Map<string, NodeJS.Timeout>();

const debounce = (key: string, fn: () => void, delay: number = 300) => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key)!);
  }
  
  const timeoutId = setTimeout(() => {
    fn();
    debounceMap.delete(key);
  }, delay);
  
  debounceMap.set(key, timeoutId);
};

// Throttle utility for high-frequency actions
const throttleMap = new Map<string, boolean>();

const throttle = (key: string, fn: () => void, delay: number = 1000) => {
  if (throttleMap.get(key)) {
    return;
  }
  
  throttleMap.set(key, true);
  fn();
  
  setTimeout(() => {
    throttleMap.set(key, false);
  }, delay);
};

// Toast configuration with accessibility and performance improvements
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#363636',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Helvetica Neue, Arial, sans-serif',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '400px',
    zIndex: 9999,
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#22c55e',
      secondary: '#fff',
    },
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
    ariaProps: {
      role: 'alert',
      'aria-live': 'assertive',
    },
  },
  loading: {
    duration: Infinity, // Loading toasts don't auto-dismiss
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#fff',
    },
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  },
  info: {
    duration: 4000,
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#fff',
    },
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  },
};

// Custom toast functions with ULICA branding
export const showToast = {
  // Success notifications
  success: (message: string, options?: any) => {
    return toast.success(message, {
      ...toastConfig.success,
      ...options,
    });
  },

  // Error notifications
  error: (message: string, options?: any) => {
    return toast.error(message, {
      ...toastConfig.error,
      ...options,
    });
  },

  // Loading notifications
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      ...toastConfig.loading,
      ...options,
    });
  },

  // Info notifications
  info: (message: string, options?: any) => {
    return toast(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: '#3b82f6',
      },
      ...options,
    });
  },

  // Warning notifications (alias of info for now)
  warning: (message: string, options?: any) => {
    return toast(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: '#f97316', // amber
      },
      ...options,
    });
  },

  // Custom styled notifications
  custom: (message: string, type: 'success' | 'error' | 'info' | 'loading', options?: any) => {
    const baseConfig = {
      ...toastConfig,
      ...options,
    };

    switch (type) {
      case 'success':
        return toast.success(message, { ...baseConfig, ...toastConfig.success });
      case 'error':
        return toast.error(message, { ...baseConfig, ...toastConfig.error });
      case 'loading':
        return toast.loading(message, { ...baseConfig, ...toastConfig.loading });
      case 'info':
        return toast(message, {
          ...baseConfig,
          style: {
            ...baseConfig.style,
            background: '#3b82f6',
          },
        });
      default:
        return toast(message, baseConfig);
    }
  },

  // Dismiss specific toast
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

// Specific ULICA action toasts with debouncing and accessibility
export const ulicaToasts = {
  // Cart actions with debouncing for rapid clicks
  addedToCart: (productName: string) => {
    const key = `add-to-cart-${productName}`;
    debounce(key, () => {
      showToast.success(`"${productName}" added to cart!`, {
        icon: '🛒',
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }, 200);
  },

  removedFromCart: (productName: string) => {
    const key = `remove-from-cart-${productName}`;
    debounce(key, () => {
      showToast.info(`"${productName}" removed from cart`, {
        icon: '🗑️',
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }, 200);
  },

  quantityUpdated: (productName: string, quantity: number) => {
    const key = `quantity-update-${productName}`;
    debounce(key, () => {
      showToast.info(`"${productName}" quantity updated to ${quantity}`, {
        icon: '📦',
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }, 300);
  },

  cartCleared: () => {
    return showToast.info('Cart cleared successfully', {
      icon: '🧹',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },

  // Order actions
  orderPlaced: (orderNumber: string) => {
    return showToast.success(`Order #${orderNumber} placed successfully!`, {
      icon: '✅',
      duration: 6000,
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  orderFailed: (error?: string) => {
    return showToast.error(`Order failed: ${error || 'Please try again'}`, {
      icon: '❌',
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  // Authentication actions
  loginSuccess: (userName?: string) => {
    return showToast.success(`Welcome back${userName ? `, ${userName}` : ''}!`, {
      icon: '👋',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },

  loginFailed: (error?: string) => {
    return showToast.error(`Login failed: ${error || 'Invalid credentials'}`, {
      icon: '🔒',
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  registerSuccess: (email: string) => {
    return showToast.success(`Account created for ${email}!`, {
      icon: '🎉',
      duration: 5000,
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },

  registerFailed: (error?: string) => {
    return showToast.error(`Registration failed: ${error || 'Please try again'}`, {
      icon: '❌',
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  logoutSuccess: () => {
    return showToast.info('Logged out successfully', {
      icon: '👋',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },

  // Payment actions
  paymentSuccess: (amount: number) => {
    return showToast.success(`Payment of ₹${amount} successful!`, {
      icon: '💳',
      duration: 5000,
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  paymentFailed: (error?: string) => {
    return showToast.error(`Payment failed: ${error || 'Please try again'}`, {
      icon: '💳',
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  // Wishlist actions with throttling
  addedToWishlist: (productName: string) => {
    const key = `add-to-wishlist-${productName}`;
    throttle(key, () => {
      showToast.success(`"${productName}" added to wishlist!`, {
        icon: '❤️',
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }, 1000);
  },

  removedFromWishlist: (productName: string) => {
    const key = `remove-from-wishlist-${productName}`;
    throttle(key, () => {
      showToast.info(`"${productName}" removed from wishlist`, {
        icon: '💔',
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
    }, 1000);
  },

  // General actions
  networkError: () => {
    return showToast.error('Network error. Please check your connection.', {
      icon: '🌐',
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  serverError: () => {
    return showToast.error('Server error. Please try again later.', {
      icon: '🔧',
      ariaProps: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });
  },

  // Loading states
  processingOrder: () => {
    return showToast.loading('Processing your order...', {
      icon: '⏳',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },

  processingPayment: () => {
    return showToast.loading('Processing payment...', {
      icon: '💳',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },

  savingChanges: () => {
    return showToast.loading('Saving changes...', {
      icon: '💾',
      ariaProps: {
        role: 'status',
        'aria-live': 'polite',
      },
    });
  },
};

// Async wrapper for API calls with toast notifications
export const withToast = async <T>(
  asyncFn: () => Promise<T>,
  options: {
    loading?: string;
    success?: string | ((result: T) => string);
    error?: string | ((error: any) => string);
  }
): Promise<T> => {
  let toastId: string | undefined;

  try {
    // Show loading toast if specified
    if (options.loading) {
      toastId = showToast.loading(options.loading);
    }

    // Execute the async function
    const result = await asyncFn();

    // Dismiss loading toast
    if (toastId) {
      showToast.dismiss(toastId);
    }

    // Show success toast if specified
    if (options.success) {
      const message = typeof options.success === 'function' 
        ? options.success(result) 
        : options.success;
      showToast.success(message);
    }

    return result;
  } catch (error) {
    // Dismiss loading toast
    if (toastId) {
      showToast.dismiss(toastId);
    }

    // Show error toast
    const errorMessage = typeof options.error === 'function' 
      ? options.error(error) 
      : (options.error || 'An error occurred');
    showToast.error(errorMessage);

    throw error;
  }
};

// Keyboard accessibility handler
export const setupKeyboardAccessibility = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      showToast.dismissAll();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }
};

// Reduced motion support
export const setupReducedMotion = () => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = e.matches;
      if (matches) {
        // Disable animations for users who prefer reduced motion
        document.documentElement.style.setProperty('--toast-duration', '0ms');
      } else {
        document.documentElement.style.setProperty('--toast-duration', '300ms');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    handleChange(mediaQuery);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }
};

// Toast stacking limit (max 4 visible toasts)
export const MAX_TOASTS = 4;

// Enhanced toast configuration with stacking limit
const enhancedToastConfig = {
  ...toastConfig,
  // Limit the number of visible toasts
  maxToasts: MAX_TOASTS,
};

export default showToast;
