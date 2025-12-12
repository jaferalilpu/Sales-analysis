/**
 * Order-related types for backend
 */

export interface OrderItem {
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  title?: string;
}

export interface OrderItemWithProduct extends OrderItem {
  variant: {
    id: string;
    title: string;
    price: number;
    product: {
      id: string;
      title: string;
      images?: Array<{ url: string }>;
    };
  };
}

