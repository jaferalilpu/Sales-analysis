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

    // Fetch settings from backend
    const settingsResponse = await fetch(`${BACKEND_URL}/api/admin/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const settingsData = await settingsResponse.json();
    
    if (settingsResponse.ok) {
      return NextResponse.json(settingsData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: settingsResponse.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    // Update settings via backend
    const settingsResponse = await fetch(`${BACKEND_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const settingsData = await settingsResponse.json();
    
    if (settingsResponse.ok) {
      return NextResponse.json(settingsData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: settingsResponse.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
