/**
 * Drop-related types for frontend
 */

export interface DropProduct {
  product: {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
    images?: Array<{
      url: string;
      altText?: string;
    }>;
  };
}

export interface Drop {
  id: string;
  name: string;
  description?: string;
  bannerImage?: string;
  bannerVideo?: string;
  startDate: string;
  endDate: string;
  status?: string;
  purchaseLimitPerCustomer?: number;
  isPublished: boolean;
  dropProducts?: DropProduct[];
}

export interface DropFormData {
  name: string;
  description?: string;
  bannerImage?: string;
  bannerVideo?: string;
  startDate: string;
  endDate: string;
  productIds?: string[];
  purchaseLimitPerCustomer?: number;
  isPublished: boolean;
}

