'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ClockIcon, CpuChipIcon, ExclamationTriangleIcon } from '@/components/ui/icons';

interface PerformanceData {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  memoryUsage: number;
  bundleSize: number;
}

interface PerformanceReportProps {
  beforeData?: PerformanceData;
  afterData?: PerformanceData;
}

export function PerformanceReport({ beforeData, afterData }: PerformanceReportProps) {
  const [currentData, setCurrentData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    // Simulate real-time performance data collection
    const collectPerformanceData = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
        
        const data: PerformanceData = {
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          timeToInteractive: navigation.domInteractive - navigation.fetchStart,
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,
          cumulativeLayoutShift: 0, // Would need to be measured with PerformanceObserver
          totalBlockingTime: 0, // Would need to be calculated from long tasks
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          bundleSize: 0 // Would need to be calculated from network requests
        };
        
        setCurrentData(data);
      }
    };

    collectPerformanceData();
    const interval = setInterval(collectPerformanceData, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateImprovement = (before: number, after: number) => {
    if (before === 0) return 0;
    return ((before - after) / before * 100);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  const metrics = [
    {
      name: 'Page Load Time',
      icon: ClockIcon,
      before: beforeData?.pageLoadTime || 0,
      after: afterData?.pageLoadTime || currentData?.pageLoadTime || 0,
      unit: 'ms',
      format: formatTime,
      better: 'lower'
    },
    {
      name: 'Time to Interactive',
      icon: ClockIcon,
      before: beforeData?.timeToInteractive || 0,
      after: afterData?.timeToInteractive || currentData?.timeToInteractive || 0,
      unit: 'ms',
      format: formatTime,
      better: 'lower'
    },
    {
      name: 'First Contentful Paint',
      icon: ChartBarIcon,
      before: beforeData?.firstContentfulPaint || 0,
      after: afterData?.firstContentfulPaint || currentData?.firstContentfulPaint || 0,
      unit: 'ms',
      format: formatTime,
      better: 'lower'
    },
    {
      name: 'Largest Contentful Paint',
      icon: ChartBarIcon,
      before: beforeData?.largestContentfulPaint || 0,
      after: afterData?.largestContentfulPaint || currentData?.largestContentfulPaint || 0,
      unit: 'ms',
      format: formatTime,
      better: 'lower'
    },
    {
      name: 'Memory Usage',
      icon: CpuChipIcon,
      before: beforeData?.memoryUsage || 0,
      after: afterData?.memoryUsage || currentData?.memoryUsage || 0,
      unit: 'bytes',
      format: formatBytes,
      better: 'lower'
    },
    {
      name: 'Bundle Size',
      icon: ExclamationTriangleIcon,
      before: beforeData?.bundleSize || 0,
      after: afterData?.bundleSize || currentData?.bundleSize || 0,
      unit: 'bytes',
      format: formatBytes,
      better: 'lower'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Report</h3>
        <p className="text-sm text-gray-600">
          {beforeData && afterData ? 'Before vs After Optimization' : 'Current Performance Metrics'}
        </p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const improvement = beforeData && afterData 
            ? calculateImprovement(metric.before, metric.after)
            : 0;
          
          const isImprovement = metric.better === 'lower' 
            ? improvement > 0 
            : improvement < 0;
          
          const improvementColor = isImprovement ? 'text-green-600' : 'text-red-600';
          const improvementIcon = isImprovement ? '↗' : '↘';

          return (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <metric.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                  {beforeData && afterData && (
                    <p className="text-xs text-gray-500">
                      Before: {metric.format(metric.before)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {metric.format(metric.after)}
                </p>
                {beforeData && afterData && (
                  <p className={`text-xs font-medium ${improvementColor}`}>
                    {improvementIcon} {Math.abs(improvement).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {beforeData && afterData && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Optimization Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Average Improvement:</p>
              <p className="font-semibold text-blue-900">
                {metrics.reduce((sum, metric) => sum + Math.abs(calculateImprovement(metric.before, metric.after)), 0) / metrics.length}%
              </p>
            </div>
            <div>
              <p className="text-blue-700">Total Time Saved:</p>
              <p className="font-semibold text-blue-900">
                {formatTime(metrics.reduce((sum, metric) => sum + (metric.before - metric.after), 0))}
              </p>
            </div>
          </div>
        </div>
      )}

      {!beforeData && !afterData && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
            Performance monitoring is active. Data will be collected in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
