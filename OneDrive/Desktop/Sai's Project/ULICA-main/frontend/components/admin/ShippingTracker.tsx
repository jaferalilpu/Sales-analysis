'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@/components/ui/icons';

interface ShippingTrackerProps {
  trackingNumber: string;
  courierName: string;
}

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface TrackingData {
  trackingNumber: string;
  courierName: string;
  status: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
  currentLocation: string;
  isDelivered: boolean;
  isInTransit: boolean;
}

export function ShippingTracker({ trackingNumber, courierName }: ShippingTrackerProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/shipping/track/${trackingNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courierName,
          trackingNumber
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTrackingData(data.trackingData);
      } else {
        setError(data.message || 'Failed to fetch tracking data');
      }
    } catch (error) {
      
      setError('An error occurred while fetching tracking data');
    } finally {
      setLoading(false);
    }
  }, [trackingNumber, courierName]);

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingData();
    }
  }, [trackingNumber, fetchTrackingData]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      case 'exception':
      case 'delayed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'exception':
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTrackingData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tracking data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tracking Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TruckIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Package Tracking</h3>
              <p className="text-sm text-gray-600">Tracking Number: {trackingData.trackingNumber}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
            {trackingData.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Current Location</p>
              <p className="text-sm text-gray-600">{trackingData.currentLocation}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Estimated Delivery</p>
              <p className="text-sm text-gray-600">{trackingData.estimatedDelivery}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TruckIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Courier</p>
              <p className="text-sm text-gray-600">{trackingData.courierName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h4>
        <div className="space-y-4">
          {trackingData.events.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(event.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.description}</p>
                  <p className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Status */}
      {trackingData.isDelivered && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <div>
              <h4 className="text-lg font-semibold text-green-800">Package Delivered</h4>
              <p className="text-green-700">
                Your package has been successfully delivered to the recipient.
              </p>
            </div>
          </div>
        </div>
      )}

      {trackingData.isInTransit && !trackingData.isDelivered && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <TruckIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h4 className="text-lg font-semibold text-blue-800">Package In Transit</h4>
              <p className="text-blue-700">
                Your package is on its way and will be delivered soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchTrackingData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
        >
          <ClockIcon className="w-4 h-4 mr-2" />
          Refresh Tracking
        </button>
      </div>
    </div>
  );
}
