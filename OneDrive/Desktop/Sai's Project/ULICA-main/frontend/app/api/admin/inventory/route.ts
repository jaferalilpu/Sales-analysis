import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const targetUrl = new URL('/api/admin/inventory', BACKEND_URL);
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const response = await fetch(targetUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

