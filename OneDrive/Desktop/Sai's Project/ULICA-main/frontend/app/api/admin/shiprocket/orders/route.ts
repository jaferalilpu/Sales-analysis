import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = new URL('/api/shiprocket/orders', BACKEND_URL);
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping orders' },
      { status: 500 }
    );
  }
}

