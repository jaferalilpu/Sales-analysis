import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types/product';
import { ApiResponse } from '@/types/api';
import { getErrorMessage } from '@/types/common';

// GET /api/admin/products - Get all products for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to the backend admin endpoint
    const backendResponse = await fetch(`${backendUrl}/api/admin/products?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    
    // Use products directly from backend (already in correct format)
    const products = data.data?.products || [];

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((p: Product) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.price || p.variants?.[0]?.price || 0,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          sku: p.sku,
          images: p.images || [],
          variants: p.variants || [],
          category: p.category,
          createdAt: p.createdAt,
        })),
        pagination: data.data?.pagination || {
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '20'),
          total: products.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to the backend admin endpoint
    const backendResponse = await fetch(`${backendUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || `Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
