import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify admin access
    const profileResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileData = await profileResponse.json();
    
    if (!profileResponse.ok || profileData.data.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Fetch reports from backend
    const reportsResponse = await fetch(`${BACKEND_URL}/api/admin/reports?range=${range}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const reportsData = await reportsResponse.json();
    
    if (reportsResponse.ok) {
      return NextResponse.json(reportsData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reports' },
        { status: reportsResponse.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
