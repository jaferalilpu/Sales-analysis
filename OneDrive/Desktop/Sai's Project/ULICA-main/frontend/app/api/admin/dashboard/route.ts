import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || data
    });
  } catch (error) {
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          orders: { total: 0, pending: 0, revenue: 0 },
          products: { total: 0, lowStock: 0 },
          customers: { total: 0 },
          fulfillment: { unfulfilled: 0 },
          marketing: { abandonedCarts: 0 },
          recentOrders: [],
          monthlyRevenue: []
        }
      }
    });
  }
}