import { NextRequest, NextResponse } from 'next/server';

import { getBackendUrl } from '@/lib/api-config';
const BACKEND_URL = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drops/archived`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archived drops' },
      { status: 500 }
    );
  }
}
