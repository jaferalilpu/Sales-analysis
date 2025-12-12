/**
 * Address-related types for frontend
 */

export interface AddressFormData {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface SavedAddress {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

