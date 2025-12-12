import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// GET /api/admin/drops/[id] - Get drop by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/drops/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle non-JSON responses (like rate limit errors)
    const contentType = response.headers.get('content-type');
    let data;
    
    // Read response as text first (can only read once)
    const responseText = await response.text();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Backend returned invalid JSON: ${responseText.substring(0, 100)}`
          }, 
          { status: response.status }
        );
      }
    } else {
      // Non-JSON response (like rate limit errors)
      
      return NextResponse.json(
        { 
          success: false, 
          error: responseText.includes('Too many') 
            ? 'Too many requests. Please wait a moment and try again.' 
            : `Backend error: ${responseText.substring(0, 100)}`
        }, 
        { status: response.status }
      );
    }
    
    if (!response.ok) {
      
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || data.message || 'Failed to fetch drop',
          details: data.details
        }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/drops/[id] - Update drop
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    const body = await request.json();
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Clean up the body - remove undefined values and handle dates
    const cleanedBody: Record<string, unknown> = {};
    if (body.name) cleanedBody.name = body.name;
    if (body.description !== undefined) cleanedBody.description = body.description || undefined;
    if (body.bannerImage && !body.bannerImage.startsWith('blob:')) {
      cleanedBody.bannerImage = body.bannerImage;
    }
    if (body.startDate) cleanedBody.startDate = body.startDate;
    if (body.endDate) cleanedBody.endDate = body.endDate;
    if (body.productIds && Array.isArray(body.productIds) && body.productIds.length > 0) {
      cleanedBody.productIds = body.productIds;
    }
    if (body.purchaseLimitPerCustomer !== undefined && body.purchaseLimitPerCustomer !== null) {
      cleanedBody.purchaseLimitPerCustomer = parseInt(body.purchaseLimitPerCustomer);
    }
    if (body.isPublished !== undefined) {
      cleanedBody.isPublished = body.isPublished;
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/drops/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedBody),
    });

    const data = await response.json();
    
    if (!response.ok) {
      
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || data.message || 'Failed to update drop',
          details: data.details
        }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/drops/[id] - Delete drop
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/drops/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
