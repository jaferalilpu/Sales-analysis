import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status })
    });

    const response = await fetch(`${BACKEND_URL}/api/support/my-tickets?${queryParams.toString()}`, {
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

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

