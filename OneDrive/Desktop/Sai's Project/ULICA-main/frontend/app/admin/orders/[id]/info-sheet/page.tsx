'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ProductInfoSheet } from '@/components/admin/ProductInfoSheet';
import { Order as OrderType } from '@/types/order';

interface ProductInfoSheetOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: Array<{
    product: { title: string; sku?: string };
    variant?: { title?: string; sku?: string };
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  total: number;
  status: string;
  createdAt: string;
  courier?: string;
  expectedDelivery?: string;
}

export default function OrderInfoSheetPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<ProductInfoSheetOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        const apiOrder: OrderType = data.data;
        // Transform API order to ProductInfoSheet format
        const transformedOrder: ProductInfoSheetOrder = {
          id: apiOrder.id,
          orderNumber: apiOrder.orderNumber,
          customer: {
            name: apiOrder.user?.name || 'Unknown',
            email: apiOrder.user?.email || '',
            phone: apiOrder.addresses?.find(a => a.type === 'shipping')?.phone
          },
          shippingAddress: apiOrder.addresses?.find(a => a.type === 'shipping') ? {
            name: `${apiOrder.addresses.find(a => a.type === 'shipping')?.firstName || ''} ${apiOrder.addresses.find(a => a.type === 'shipping')?.lastName || ''}`.trim(),
            address: apiOrder.addresses.find(a => a.type === 'shipping')?.address1 || '',
            city: apiOrder.addresses.find(a => a.type === 'shipping')?.city || '',
            state: apiOrder.addresses.find(a => a.type === 'shipping')?.state || '',
            pincode: apiOrder.addresses.find(a => a.type === 'shipping')?.pincode || '',
            phone: apiOrder.addresses.find(a => a.type === 'shipping')?.phone || ''
          } : undefined,
          items: apiOrder.items.map(item => ({
            product: {
              title: item.title,
              sku: item.product?.id
            },
            variant: item.variant ? {
              title: item.variantTitle,
              sku: item.variantId
            } : undefined,
            quantity: item.quantity,
            price: item.price
          })),
          total: apiOrder.totalAmount,
          status: apiOrder.status,
          createdAt: apiOrder.createdAt,
          courier: apiOrder.courierName,
          expectedDelivery: apiOrder.deliveredAt
        };
        setOrder(transformedOrder);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">Order not found</div>
      </div>
    );
  }

  return <ProductInfoSheet order={order} />;
}

