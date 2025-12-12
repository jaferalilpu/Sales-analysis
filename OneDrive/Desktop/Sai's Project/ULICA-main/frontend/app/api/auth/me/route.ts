import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify token with backend
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      const text = await response.text();
      
      return NextResponse.json(
        { success: false, error: 'Invalid response from server', details: text },
        { status: response.status || 500 }
      );
    }
    
    if (response.ok) {
      // Handle different response structures
      const user = data.data?.user || data.user || data;
      return NextResponse.json({
        success: true,
        data: { user }
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'Invalid token' },
        { status: response.status || 401 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}
