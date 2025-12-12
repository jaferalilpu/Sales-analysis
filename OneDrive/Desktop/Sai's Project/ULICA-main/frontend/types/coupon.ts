/**
 * Coupon types for frontend
 */

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount?: number;
  appliesTo?: string[];
}

export interface CouponFormData {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  usageLimit?: number;
  appliesTo?: string[];
}

