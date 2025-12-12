/**
 * Product-related types for backend
 */

export interface ProductVariantInput {
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQty: number;
  weight?: number;
  dimensions?: string;
  options?: Record<string, unknown>;
  attributes?: string;
}

export interface ProductImageInput {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  tags?: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sku?: string;
  variants: ProductVariantInput[];
  images: ProductImageInput[];
  sizeChart?: Array<{
    size: string;
    chest?: string;
    length?: string;
    sleeve?: string;
    shoulder?: string;
  }>;
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
}

