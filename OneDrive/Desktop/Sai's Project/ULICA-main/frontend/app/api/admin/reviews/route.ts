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

    // Fetch reviews from backend
    const reviewsResponse = await fetch(`${BACKEND_URL}/api/reviews`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const reviewsData = await reviewsResponse.json();
    
    if (reviewsResponse.ok) {
      return NextResponse.json(reviewsData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: reviewsResponse.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
