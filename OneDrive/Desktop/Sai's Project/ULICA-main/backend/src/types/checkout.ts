/**
 * Checkout-related types for backend
 */

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  price?: number;
  title?: string;
}

export interface ShippingAddressInput {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export interface BillingAddressInput extends ShippingAddressInput {
  // Same as shipping for now
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  billingAddress?: BillingAddressInput;
  paymentMethod: string;
  couponCode?: string;
  email?: string;
  phone?: string;
  confirmationFee?: number;
  confirmationFeePaymentMethod?: string;
}

