/**
 * Authentication-related types for frontend
 */

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  referralCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
    token?: string;
    accessToken?: string;
  };
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

