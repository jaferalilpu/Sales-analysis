'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface TrackingData {
  awbCode: string;
  courierName: string;
  status: string;
  currentStatus: string;
  estimatedDelivery: string;
  trackingEvents: TrackingEvent[];
}

interface OrderTrackingProps {
  awbCode: string;
  orderId: string;
}

export function OrderTracking({ awbCode, orderId }: OrderTrackingProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();

  const fetchTrackingData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/tracking/${awbCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTrackingData(data.data);
        setLastUpdated(new Date());
      } else {
        setError(data.error || 'Failed to fetch tracking data');
      }
    } catch (error) {
      console.error('Tracking fetch error:', error);
      setError('Failed to fetch tracking information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (awbCode) {
      fetchTrackingData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchTrackingData, 30000);
      return () => clearInterval(interval);
    }
  }, [awbCode]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'in transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked up':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'out for delivery':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'in transit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'picked up':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTrackingData}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tracking Data</h3>
          <p className="text-gray-600">Tracking information is not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
          <p className="text-sm text-gray-600">Order #{orderId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">AWB: {trackingData.awbCode}</p>
          <p className="text-sm text-gray-500">Courier: {trackingData.courierName}</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.currentStatus)}`}>
            {getStatusIcon(trackingData.currentStatus)}
            <span className="ml-2">{trackingData.currentStatus}</span>
          </span>
        </div>
        {trackingData.estimatedDelivery && (
          <p className="text-sm text-gray-600">
            Estimated delivery: {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Tracking History</h4>
        <div className="relative">
          {trackingData.trackingEvents.map((event, index) => (
            <div key={index} className="relative flex items-start space-x-3 pb-4">
              {index !== trackingData.trackingEvents.length - 1 && (
                <div className="absolute left-2 top-8 w-0.5 h-full bg-gray-200"></div>
              )}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-black' : 'bg-gray-300'
              }`}>
                {index === 0 && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{event.status}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
                {event.location && (
                  <p className="text-xs text-gray-500">📍 {event.location}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
