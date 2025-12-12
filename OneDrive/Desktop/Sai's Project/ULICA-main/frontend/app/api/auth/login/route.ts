import { NextRequest, NextResponse } from 'next/server';

import { getBackendUrl } from '@/lib/api-config';
const BACKEND_URL = getBackendUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // If login is successful, set cookies on frontend domain
    if (response.ok && data.success && data.data?.accessToken) {
      const nextResponse = NextResponse.json(data, { status: response.status });
      
      // Set access token cookie (httpOnly for security, but allow reading for API routes)
      nextResponse.cookies.set('accessToken', data.data.accessToken, {
        httpOnly: true, // Changed to httpOnly for security
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes (matching backend)
        path: '/'
      });
      
      // Set refresh token cookie if available
      if (data.data.refreshToken) {
        nextResponse.cookies.set('refreshToken', data.data.refreshToken, {
          httpOnly: true, // Changed to httpOnly for security
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        });
      }
      
      return nextResponse;
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
