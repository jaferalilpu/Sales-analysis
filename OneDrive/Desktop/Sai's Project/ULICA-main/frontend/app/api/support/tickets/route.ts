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

    // Get user's own tickets
    const response = await fetch(`${BACKEND_URL}/api/support/my-tickets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // If endpoint doesn't exist (404), return empty array
    if (response.status === 404) {
      return NextResponse.json({
        success: true,
        data: { tickets: [] }
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      return NextResponse.json({
        success: true,
        data: { tickets: [] }
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    // Return empty array on error
    return NextResponse.json({
      success: true,
      data: { tickets: [] }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/support/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, message: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

