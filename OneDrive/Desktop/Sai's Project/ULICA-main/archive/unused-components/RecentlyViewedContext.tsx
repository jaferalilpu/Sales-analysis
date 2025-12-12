'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface RecentlyViewedItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  viewedAt: string;
}

interface RecentlyViewedContextType {
  recentlyViewed: RecentlyViewedItem[];
  addToRecentlyViewed: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  removeFromRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
  getRecentlyViewed: (limit?: number) => RecentlyViewedItem[];
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load recently viewed from localStorage on initial mount
  useEffect(() => {
    const savedRecentlyViewed = localStorage.getItem('ulica_recently_viewed');
    if (savedRecentlyViewed) {
      try {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      } catch (error) {
        // Failed to parse recently viewed from localStorage - handled by error boundary
        localStorage.removeItem('ulica_recently_viewed'); // Clear corrupted data
      }
    }
  }, []);

  // Save recently viewed to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ulica_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setRecentlyViewed(prevItems => {
      // Remove existing item if it exists
      const filteredItems = prevItems.filter(viewedItem => viewedItem.productId !== item.productId);
      
      // Add new item at the beginning
      const newItem = {
        ...item,
        viewedAt: new Date().toISOString()
      };
      
      // Keep only last 20 items
      const updatedItems = [newItem, ...filteredItems].slice(0, 20);
      
      return updatedItems;
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prevItems => {
      return prevItems.filter(item => item.productId !== productId);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  const getRecentlyViewed = useCallback((limit: number = 10) => {
    return recentlyViewed.slice(0, limit);
  }, [recentlyViewed]);

  const value = useMemo(() => ({
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
    getRecentlyViewed,
  }), [recentlyViewed, addToRecentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed, getRecentlyViewed]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}
