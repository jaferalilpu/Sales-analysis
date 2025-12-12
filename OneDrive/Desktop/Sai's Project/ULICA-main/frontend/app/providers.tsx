'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { ulicaToasts, showToast } from '@/lib/toast';

// User interface
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  createdAt?: string;
  isEmailVerified?: boolean;
}

// Auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      isLoading: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
      isAdmin: false,
    };
  }
  return context;
}

// Theme context
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      theme: 'light' as ThemeMode,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}

// Global loading context
interface LoadingContextType {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  message: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    return {
      isLoading: false,
      showLoading: () => {},
      hideLoading: () => {},
      message: 'Loading...',
    };
  }
  return context;
}

// Wishlist context
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  variant?: {
    name: string;
    options: Record<string, unknown>;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, 'id'>) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    return {
      items: [],
      isLoading: false,
      addToWishlist: async () => {},
      removeFromWishlist: async () => {},
      isInWishlist: () => false,
      toggleWishlist: async () => {},
    };
  }
  return context;
}

// Cart context
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    name: string;
    options: Record<string, unknown>;
  };
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,
      addToCart: async () => {},
      removeFromCart: async () => {},
      updateQuantity: async () => {},
      clearCart: async () => {},
      isInCart: () => false,
    };
  }
  return context;
}

// Main providers component
export function Providers({ children }: { children: React.ReactNode }) {
  // Theme state
  const [theme, setThemeState] = useState<ThemeMode>('light');
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem('ulica-theme') as ThemeMode | null;
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
      }
    } catch {
      setThemeState('light');
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('ulica-theme', theme);
      } catch {
        // ignore storage errors
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const themeValue: ThemeContextType = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  // Global loading state
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = useCallback((message?: string) => {
    setLoadingCount((prev) => prev + 1);
    if (message) {
      setLoadingMessage(message);
    }
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const loadingValue: LoadingContextType = useMemo(
    () => ({
      isLoading: loadingCount > 0,
      showLoading,
      hideLoading,
      message: loadingMessage,
    }),
    [loadingCount, showLoading, hideLoading, loadingMessage]
  );

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading to check auth
  const isLoggingOutRef = useRef(false); // Track if logout is in progress

  const isAdmin = useMemo(() => {
    return user?.role === 'admin' || false;
  }, [user?.role]);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      // Skip loading if logout was explicitly called
      if (isLoggingOutRef.current) {
        setIsLoading(false);
        isLoggingOutRef.current = false;
        return;
      }

      try {
        // Check for token in localStorage or cookies
        const token = typeof window !== 'undefined' 
          ? (localStorage.getItem('accessToken') || document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1])
          : null;
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch user profile
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            setUser(data.data.user);
            // Update localStorage token if needed
            if (data.data.accessToken && typeof window !== 'undefined') {
              localStorage.setItem('accessToken', data.data.accessToken);
            }
          }
        } else {
          // Token invalid, clear it
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('ulica_auth_token');
            localStorage.removeItem('ulica_user');
          }
        }
      } catch (error) {
        
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('ulica_auth_token');
          localStorage.removeItem('ulica_user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Auth functions
  const login = useCallback((user: User, tokens: { accessToken: string; refreshToken: string }) => {
    setUser(user);
    // Store tokens in localStorage for now
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Set flag to prevent loadUser from re-fetching
      isLoggingOutRef.current = true;
      
      // Clear user state immediately
      setUser(null);
      
      // Clear all localStorage keys
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('ulica_auth_token');
        localStorage.removeItem('ulica_user');
      }

      // Call logout API to clear httpOnly cookies
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (apiError) {
        // Even if API call fails, we've cleared local state
        // Cookies will expire naturally or be cleared on next request
      }

      ulicaToasts.logoutSuccess();
    } catch (error) {
      showToast.error('Error logging out');
    } finally {
      // Reset flag after a short delay to allow state to settle
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 100);
    }
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  }, [user]);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const wishlistValue: WishlistContextType = useMemo(() => ({
    items: wishlistItems,
    isLoading: wishlistLoading,
    addToWishlist: async (item: Omit<WishlistItem, 'id'>) => {
      try {
        const newItem = { ...item, id: Date.now().toString() };
        setWishlistItems(prev => [...prev, newItem]);
        ulicaToasts.addedToWishlist(item.name || 'Item');
      } catch (error) {
        showToast.error('Failed to add to wishlist');
      }
    },
    removeFromWishlist: async (itemId: string) => {
      try {
        const itemToRemove = wishlistItems.find(item => item.id === itemId);
        const itemName = itemToRemove?.name || 'Item';
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        ulicaToasts.removedFromWishlist(itemName);
      } catch (error) {
        showToast.error('Failed to remove from wishlist');
      }
    },
    isInWishlist: (productId: string, variantId?: string) => {
      return wishlistItems.some(item => {
        if (item.productId !== productId) return false;
        // If variantId is provided, we need to check if the variant matches
        // Since we store variant as { name, options }, we'll check if variant exists
        // For now, if variantId is provided and item has a variant, consider it a match
        // This could be improved to do exact variant matching if needed
        if (variantId) {
          return !!item.variant; // If variantId provided, item must have variant
        }
        return !item.variant; // If no variantId, item should not have variant
      });
    },
    toggleWishlist: async (item: Omit<WishlistItem, 'id'>) => {
      try {
        // Check for existing item by productId and variant (if variant exists)
        const existingItem = wishlistItems.find(wishlistItem => {
          if (wishlistItem.productId !== item.productId) return false;
          
          // Compare variants - both must have variant or both must not have variant
          if (item.variant && wishlistItem.variant) {
            // Compare variant by stringifying options and name
            return JSON.stringify(wishlistItem.variant) === JSON.stringify(item.variant);
          }
          // If one has variant and other doesn't, they're different
          return !item.variant && !wishlistItem.variant;
        });
        const itemName = item.name || 'Item';
        
        if (existingItem) {
          setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== existingItem.id));
          ulicaToasts.removedFromWishlist(itemName);
        } else {
          const newItem = { ...item, id: Date.now().toString() };
          setWishlistItems(prev => [...prev, newItem]);
          ulicaToasts.addedToWishlist(itemName);
        }
      } catch (error) {
        showToast.error('Error updating wishlist');
      }
    },
  }), [wishlistItems, wishlistLoading]);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('ulica_cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
          }
        }
      } catch (error) {
        
      }
    }
  }, []);

  // Sync cartItems to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ulica_cart', JSON.stringify(cartItems));
        // Dispatch event to notify CartWidget
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } catch (error) {
        
      }
    }
  }, [cartItems]);

  const cartValue: CartContextType = useMemo(() => ({
    items: cartItems,
    total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    isLoading: cartLoading,
    addToCart: async (item: Omit<CartItem, 'id'>) => {
      try {
        const newItem = { ...item, id: Date.now().toString() };
        let itemName = item.name || 'Item';
        
        setCartItems(prev => {
          // Check if item already exists (same product and variant)
          const existingIndex = prev.findIndex(
            existing => existing.productId === item.productId && 
            (item.variantId ? existing.variantId === item.variantId : !existing.variantId)
          );
          
          if (existingIndex >= 0) {
            // Update quantity of existing item
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + (item.quantity || 1)
            };
            // Show toast for quantity update
            ulicaToasts.quantityUpdated(itemName, updated[existingIndex].quantity);
            return updated;
          } else {
            // Add new item
            ulicaToasts.addedToCart(itemName);
            return [...prev, newItem];
          }
        });
        // Dispatch event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartItemAdded'));
        }
      } catch (error) {
        showToast.error('Failed to add item to cart');
      }
    },
    removeFromCart: async (itemId: string) => {
      try {
        const itemToRemove = cartItems.find(item => item.id === itemId);
        const itemName = itemToRemove?.name || 'Item';
        
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        
        // Show toast for removal
        ulicaToasts.removedFromCart(itemName);
        
        // Dispatch event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartItemRemoved'));
        }
      } catch (error) {
        showToast.error('Failed to remove item from cart');
      }
    },
    updateQuantity: async (itemId: string, quantity: number) => {
      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const itemToRemove = cartItems.find(item => item.id === itemId);
          const itemName = itemToRemove?.name || 'Item';
          
          setCartItems(prev => prev.filter(item => item.id !== itemId));
          ulicaToasts.removedFromCart(itemName);
        } else {
          const updatedItem = cartItems.find(item => item.id === itemId);
          const itemName = updatedItem?.name || 'Item';
          
          setCartItems(prev => 
            prev.map(item => 
              item.id === itemId ? { ...item, quantity } : item
            ).filter(item => item.quantity > 0)
          );
          
          // Show toast for quantity update
          showToast.success('Cart updated');
        }
        
        // Dispatch event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
      } catch (error) {
        showToast.error('Failed to update cart');
      }
    },
    clearCart: async () => {
      try {
        setCartItems([]);
        ulicaToasts.cartCleared();
        // Dispatch event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
      } catch (error) {
        showToast.error('Failed to clear cart');
      }
    },
    isInCart: (productId: string, variantId?: string) => {
      return cartItems.some(item => 
        item.productId === productId && 
        (variantId ? item.variantId === variantId : true)
      );
    },
  }), [cartItems, cartLoading]);

  // Auth context value
  const authValue: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAdmin,
  }), [user, isLoading, login, logout, updateUser, isAdmin]);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={themeValue}>
      <LoadingContext.Provider value={loadingValue}>
        <AuthContext.Provider value={authValue}>
          <WishlistContext.Provider value={wishlistValue}>
            <CartContext.Provider value={cartValue}>
              {children}

              {loadingCount > 0 && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 shadow-xl dark:bg-gray-900">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{loadingMessage}</p>
                  </div>
                </div>
              )}

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: isDark ? 'rgba(17, 24, 39, 0.95)' : '#2d2d2d',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 10px 30px -12px rgba(0,0,0,0.5)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </CartContext.Provider>
          </WishlistContext.Provider>
        </AuthContext.Provider>
      </LoadingContext.Provider>
    </ThemeContext.Provider>
  );
}