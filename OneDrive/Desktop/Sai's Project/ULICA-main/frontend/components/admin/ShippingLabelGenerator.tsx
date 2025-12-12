'use client';

import { useState, useEffect, useCallback } from 'react';
import { PrinterIcon, ArrowDownTrayIcon, TruckIcon, MapPinIcon, ClockIcon, CheckCircleIcon } from '@/components/ui/icons';
import { showToast } from '@/lib/toast';

interface LabelData {
  trackingNumber?: string;
  courierName?: string;
  labelUrl?: string;
  [key: string]: unknown;
}

interface ShippingLabelGeneratorProps {
  orderId: string;
  onLabelGenerated?: (labelData: LabelData) => void;
}

interface ShippingRate {
  courierName: string;
  courierId: string;
  rate: number;
  estimatedDelivery: string;
  serviceType: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}

export function ShippingLabelGenerator({ orderId, onLabelGenerated }: ShippingLabelGeneratorProps) {
  const [order, setOrder] = useState<any>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [labelData, setLabelData] = useState<any>(null);

  const fetchShippingRates = useCallback(async (address: ShippingAddress) => {
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupPincode: '110001', // Default pickup pincode
          deliveryPincode: address.pincode,
          weight: 1, // Default weight in kg
          codAmount: order?.paymentMethod === 'cod' ? order.totalAmount : 0
        })
      });

      const data = await response.json();
      if (data.success) {
        setShippingRates(data.rates || []);
      }
    } catch (error) {
      
      showToast.error('Failed to fetch shipping rates.');
    }
  }, [order?.paymentMethod, order?.totalAmount]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setShippingAddress(data.order.shippingAddress);
        await fetchShippingRates(data.order.shippingAddress);
      }
    } catch (error) {
      
      showToast.error('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [fetchShippingRates, orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [fetchOrderDetails, orderId]);

  const generateShippingLabel = async () => {
    if (!selectedRate || !order) return;

    try {
      setGenerating(true);
      const response = await fetch('/api/shipping/generate-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          courierId: selectedRate.courierId,
          courierName: selectedRate.courierName,
          serviceType: selectedRate.serviceType,
          shippingAddress: shippingAddress,
          billingAddress: order.billingAddress,
          items: order.items,
          weight: 1,
          codAmount: order.paymentMethod === 'cod' ? order.totalAmount : 0
        })
      });

      const data = await response.json();
      if (data.success) {
        setLabelData(data.label);
        onLabelGenerated?.(data.label);
        showToast.success('Shipping label generated.');
      } else {
        showToast.error(data.message || 'Failed to generate shipping label.');
      }
    } catch (error) {
      
      showToast.error('An error occurred while generating the shipping label.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadLabel = () => {
    if (labelData?.labelUrl) {
      const link = document.createElement('a');
      link.href = labelData.labelUrl;
      link.download = `shipping-label-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printLabel = () => {
    if (labelData?.labelUrl) {
      window.open(labelData.labelUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Order Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
            <div className="text-sm text-gray-600">
              <p>{shippingAddress?.name}</p>
              <p>{shippingAddress?.address}</p>
              <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.pincode}</p>
              <p>{shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Rates */}
      {shippingRates.length > 0 && !labelData && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Shipping Service</h3>
          <div className="space-y-3">
            {shippingRates.map((rate, index) => (
              <div
                key={index}
                onClick={() => setSelectedRate(rate)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRate?.courierId === rate.courierId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{rate.courierName}</h4>
                      <p className="text-sm text-gray-600">{rate.serviceType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{rate.rate}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {rate.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={generateShippingLabel}
              disabled={!selectedRate || generating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Label...
                </>
              ) : (
                <>
                  <TruckIcon className="w-4 h-4 mr-2" />
                  Generate Shipping Label
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generated Label */}
      {labelData && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Shipping Label Generated</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={downloadLabel}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={printLabel}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Tracking Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Tracking Number:</strong> {labelData.trackingNumber}</p>
                  <p><strong>Courier:</strong> {labelData.courierName}</p>
                  <p><strong>Service Type:</strong> {labelData.serviceType}</p>
                  <p><strong>Label Generated:</strong> {new Date(labelData.generatedAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Shipping Details</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>From:</strong> {labelData.pickupAddress?.city}</p>
                  <p><strong>To:</strong> {labelData.deliveryAddress?.city}</p>
                  <p><strong>Weight:</strong> {labelData.weight} kg</p>
                  <p><strong>COD Amount:</strong> ₹{labelData.codAmount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {labelData.labelUrl && (
            <div className="mt-4">
              <iframe
                src={labelData.labelUrl}
                className="w-full h-96 border rounded-lg"
                title="Shipping Label Preview"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
