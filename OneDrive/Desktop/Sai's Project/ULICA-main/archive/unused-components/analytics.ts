// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, currency: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
  }
};

export const trackAddToCart = (itemId: string, itemName: string, category: string, value: number, quantity: number = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        quantity: quantity,
        price: value,
      }],
    });
  }
};

export const trackRemoveFromCart = (itemId: string, itemName: string, category: string, value: number, quantity: number = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        quantity: quantity,
        price: value,
      }],
    });
  }
};

export const trackViewItem = (itemId: string, itemName: string, category: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: value,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        price: value,
      }],
    });
  }
};

export const trackBeginCheckout = (value: number, currency: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: currency,
      value: value,
      items: items,
    });
  }
};

// User engagement tracking
export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};

export const trackLogin = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method,
    });
  }
};

export const trackSignUp = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
    });
  }
};

// Custom event tracking
export const trackCustomEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Performance tracking
export const trackPageLoadTime = (loadTime: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_load_time', {
      value: Math.round(loadTime),
      custom_parameter: 'page_load_time',
    });
  }
};

// Error tracking
export const trackError = (error: string, fatal: boolean = false) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error,
      fatal: fatal,
    });
  }
};
