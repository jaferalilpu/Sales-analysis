import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// GET /api/drops - Get all published drops (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const queryString = searchParams.toString();

    const url = status 
      ? `${BACKEND_URL}/api/drops?status=${status}`
      : `${BACKEND_URL}/api/drops${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    // Handle non-OK responses
    if (!response.ok) {
      
      // Return empty data instead of error to prevent homepage crash
      return NextResponse.json({
        success: true,
        data: {
          drops: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    // Return empty data instead of error to prevent homepage crash
    return NextResponse.json({
      success: true,
      data: {
        drops: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/drops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to create drop' },
      { status: 500 }
    );
  }
}
