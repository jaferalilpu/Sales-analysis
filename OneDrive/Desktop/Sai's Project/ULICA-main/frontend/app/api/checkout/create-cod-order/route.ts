import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;
    
    const response = await fetch(`${BACKEND_URL}/api/checkout/create-cod-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If response is not JSON, return error
      const text = await response.text();
      
      return NextResponse.json(
        { success: false, message: 'Invalid response from server', details: text },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create COD order';
    return NextResponse.json(
      { success: false, message: errorMessage, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

