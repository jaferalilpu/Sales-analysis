import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${backendUrl}/api/products/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    const product = data.data?.product;

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform product to match frontend expectations
    // Backend returns: title, slug, variants[], images[], etc.
    const transformedProduct = {
      id: product.id,
      title: product.title || product.name || '',
      slug: product.slug || product.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      status: product.isActive ? 'published' : 'draft',
      featured: product.isFeatured || false,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Use variants from backend (already in correct format)
      variants: product.variants || [],
      // Use images from backend (already in correct format)
      images: product.images || [],
      category: product.category || product.categoryId || null,
      categoryId: product.categoryId || null,
      sku: product.sku || '',
      price: product.variants?.[0]?.price || product.price || 0,
      compareAtPrice: product.compareAtPrice || null,
      costPrice: product.costPrice || null,
      tags: product.tags || [],
      averageRating: product.averageRating || 0,
      reviewCount: product.reviewCount || product._count?.reviews || 0,
      isInWishlist: product.isInWishlist || false,
      relatedProducts: product.relatedProducts || [],
      _count: {
        reviews: product.reviewCount || product._count?.reviews || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: { product: transformedProduct }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${backendUrl}/api/products/${params.id}`, {
      method: 'PUT',
      headers: {
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
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${backendUrl}/api/products/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || `Backend responded with status: ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
