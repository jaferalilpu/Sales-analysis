import { Order, OrderAddress, OrderItem, Product, ProductVariant } from '@prisma/client';
import { ShiprocketConfig } from './config';

type OrderWithRelations = Order & {
  addresses: OrderAddress[];
  items: Array<
    OrderItem & {
      product?: Pick<Product, 'title' | 'sku'>;
      variant?: Pick<ProductVariant, 'sku' | 'title' | 'weight'> | null;
    }
  >;
};

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id?: number;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string | null;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email?: string | null;
  billing_phone?: string | null;
  shipping_is_billing: number;
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
  }>;
}

export function mapOrderToShiprocketPayload(
  order: OrderWithRelations,
  options: { paymentMethod?: string; subtotal?: number; config?: ShiprocketConfig } = {}
): ShiprocketOrderPayload {
  const shippingAddress =
    order.addresses.find((address) => address.type === 'shipping') ?? order.addresses[0];

  if (!shippingAddress) {
    throw new Error('Order does not have a shipping address');
  }

  const billingName = buildFullName(shippingAddress.firstName, shippingAddress.lastName);

  const defaultWeight = 0.5;
  const weight =
    order.items.reduce((total, item) => {
      if (item.variant?.weight) {
        return total + item.variant.weight * item.quantity;
      }
      return total;
    }, 0) || defaultWeight;

  const channelId =
    options.config?.channelId !== undefined && options.config?.channelId !== null
      ? Number(options.config.channelId)
      : undefined;

  return {
    order_id: order.orderNumber ?? order.id,
    order_date: order.createdAt.toISOString(),
    pickup_location: options.config?.pickupLocation ?? 'Primary',
    ...(channelId !== undefined ? { channel_id: channelId } : {}),
    billing_customer_name: billingName.first,
    billing_last_name: billingName.last,
    billing_address: shippingAddress.address1,
    billing_address_2: shippingAddress.address2 ?? null,
    billing_city: shippingAddress.city,
    billing_pincode: shippingAddress.pincode,
    billing_state: shippingAddress.state,
    billing_country: shippingAddress.country ?? 'India',
    billing_phone: shippingAddress.phone ?? null,
    shipping_is_billing: 1,
    payment_method:
      options.paymentMethod ??
      (order.paymentStatus === 'paid' ? 'Prepaid' : 'COD'),
    sub_total: options.subtotal ?? order.totalAmount ?? order.subtotal ?? 0,
    billing_email: null, // optional, filled in controller if available
    length: 10,
    breadth: 10,
    height: 10,
    weight,
    order_items: order.items.map((item) => ({
      name: item.title,
      sku: item.variant?.sku ?? item.product?.sku ?? item.productId ?? 'SKU',
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
    })),
  };
}

function buildFullName(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim() || 'Customer';
  const last = lastName?.trim() || 'ULICA';
  return { first, last };
}

