'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { 
  initGA, 
  trackPageView, 
  trackEvent, 
  trackPurchase, 
  trackAddToCart, 
  trackRemoveFromCart, 
  trackViewItem, 
  trackBeginCheckout, 
  trackSearch, 
  trackLogin, 
  trackSignUp, 
  trackCustomEvent, 
  trackError 
} from '@/lib/analytics';

interface AnalyticsContextType {
  trackPageView: (url: string, title?: string) => void;
  trackEvent: (action: string, category: string, label?: string, value?: number) => void;
  trackPurchase: (transactionId: string, value: number, currency: string, items: any[]) => void;
  trackAddToCart: (itemId: string, itemName: string, category: string, value: number, quantity?: number) => void;
  trackRemoveFromCart: (itemId: string, itemName: string, category: string, value: number, quantity?: number) => void;
  trackViewItem: (itemId: string, itemName: string, category: string, value: number) => void;
  trackBeginCheckout: (value: number, currency: string, items: any[]) => void;
  trackSearch: (searchTerm: string) => void;
  trackLogin: (method?: string) => void;
  trackSignUp: (method?: string) => void;
  trackCustomEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackError: (error: string, fatal?: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  useEffect(() => {
    // Track user login/signup
    if (user) {
      trackLogin('email');
    }
  }, [user]);

  const value: AnalyticsContextType = {
    trackPageView,
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackRemoveFromCart,
    trackViewItem,
    trackBeginCheckout,
    trackSearch,
    trackLogin,
    trackSignUp,
    trackCustomEvent,
    trackError,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
