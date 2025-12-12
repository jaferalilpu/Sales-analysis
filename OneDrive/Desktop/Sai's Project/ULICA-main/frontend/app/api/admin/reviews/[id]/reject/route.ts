import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Reject review via backend
    const reviewResponse = await fetch(`${BACKEND_URL}/api/admin/reviews/${params.id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const reviewData = await reviewResponse.json();
    
    if (reviewResponse.ok) {
      return NextResponse.json(reviewData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to reject review' },
        { status: reviewResponse.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
