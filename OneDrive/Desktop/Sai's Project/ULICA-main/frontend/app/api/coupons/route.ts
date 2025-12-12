import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/coupons`, {
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
        { success: false, message: 'Invalid response from server', error: text },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, message: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

