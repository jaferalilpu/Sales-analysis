'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  loadTime: number; // Page load time
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if (typeof window === 'undefined' || !('performance' in window)) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
      
      // Measure FID (simplified)
      let fid = 0;
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            fid = (entry as any).processingStart - entry.startTime;
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Measure CLS (simplified)
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      const ttfb = navigation.responseStart - navigation.requestStart;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      setMetrics({
        fcp: Math.round(fcp),
        lcp: Math.round(lcp),
        fid: Math.round(fid),
        cls: Math.round(cls * 1000) / 1000,
        ttfb: Math.round(ttfb),
        loadTime: Math.round(loadTime)
      });

      // Cleanup observers
      setTimeout(() => {
        fidObserver.disconnect();
        clsObserver.disconnect();
      }, 5000);
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) return null;

  const getScore = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const fcpScore = getScore(metrics.fcp, { good: 1800, poor: 3000 });
  const lcpScore = getScore(metrics.lcp, { good: 2500, poor: 4000 });
  const fidScore = getScore(metrics.fid, { good: 100, poor: 300 });
  const clsScore = getScore(metrics.cls, { good: 0.1, poor: 0.25 });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black text-white px-3 py-2 rounded-lg text-sm font-mono hover:bg-gray-800 transition-colors"
      >
        Perf: {metrics.loadTime}ms
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={`font-mono ${
                fcpScore === 'good' ? 'text-green-600' : 
                fcpScore === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.fcp}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={`font-mono ${
                lcpScore === 'good' ? 'text-green-600' : 
                lcpScore === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.lcp}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={`font-mono ${
                fidScore === 'good' ? 'text-green-600' : 
                fidScore === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.fid}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={`font-mono ${
                clsScore === 'good' ? 'text-green-600' : 
                clsScore === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.cls}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>TTFB:</span>
              <span className="font-mono text-gray-600">{metrics.ttfb}ms</span>
            </div>
            
            <div className="flex justify-between">
              <span>Load Time:</span>
              <span className="font-mono text-gray-600">{metrics.loadTime}ms</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>🟢 Good | 🟡 Needs Improvement | 🔴 Poor</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
