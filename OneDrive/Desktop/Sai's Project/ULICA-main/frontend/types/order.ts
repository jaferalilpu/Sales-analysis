/**
 * Order-related types for frontend
 */

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'picked'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_initiated'
  | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  total: number;
  product?: {
    id: string;
    title: string;
    images?: Array<{ url: string; alt?: string }>;
  };
  variant?: {
    id: string;
    title: string;
  };
}

export interface OrderAddress {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  items: OrderItem[];
  addresses?: OrderAddress[];
  pickedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingLabelUrl?: string;
  invoiceUrl?: string;
  courierName?: string;
  awbNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

