import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get token from Authorization header or cookies (checkout allows guest orders)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('accessToken')?.value;

    const response = await fetch(`${BACKEND_URL}/api/checkout/create-order`, {
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
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, message: errorMessage || 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
