/**
 * User-related types for frontend
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
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
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

