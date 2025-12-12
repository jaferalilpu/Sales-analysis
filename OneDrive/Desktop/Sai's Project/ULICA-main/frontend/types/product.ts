/**
 * Product-related types for frontend
 */

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  id: string;
  title?: string;
  name?: string;
  sku?: string;
  variantSku?: string;
  price: number;
  compareAtPrice?: number;
  comparePrice?: number;
  stockQty: number;
  isActive?: boolean;
  options?: Record<string, unknown>;
}

export interface Product {
  id: string;
  title?: string;
  name?: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  comparePrice?: number;
  originalPrice?: number;
  currentPrice?: number;
  discount?: number;
  sku?: string;
  barcodeUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  isInStock?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  inStock?: boolean;
  images?: ProductImage[] | string[];
  variants?: ProductVariant[];
  category?: string | { id?: string; name: string; slug?: string };
  categoryId?: string;
  tags?: string[];
  weight?: number;
  dimensions?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductWithDetails extends Product {
  details?: {
    material?: string;
    fit?: string;
    weight?: string;
    origin?: string;
    color?: string;
  };
  specifications?: {
    weight?: string;
    dimensions?: string;
    sizes?: string[];
  };
  washCare?: string[];
  sizeChart?: Array<{
    size: string;
    chest?: number;
    length?: number;
    sleeve?: number;
  }>;
}

