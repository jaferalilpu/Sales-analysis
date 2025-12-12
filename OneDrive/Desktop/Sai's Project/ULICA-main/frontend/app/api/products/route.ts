import { NextRequest, NextResponse } from 'next/server';
import { Product, ProductVariant } from '@/types/product';
import { ApiResponse } from '@/types/api';
import { getErrorMessage } from '@/types/common';

import { getBackendUrl } from '@/lib/api-config';
const BACKEND_URL = getBackendUrl();

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate backend URL is configured
    if (!BACKEND_URL || BACKEND_URL.includes('localhost')) {
      console.error('Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL or BACKEND_URL environment variable.');
      return NextResponse.json(
        { error: 'Backend service not configured. Please contact the administrator.' },
        { status: 503 }
      );
    }
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/products?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch products' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    
    // Transform backend response to match frontend expectations
    if (data.success && data.data?.products) {
      // Backend format: {success: true, data: {products: []}}
        // Filter out inactive products as a safety measure (backend should already filter, but double-check)
        const activeProducts = data.data.products.filter((product: Product) => product.isActive !== false);
        
        const transformedProducts = activeProducts.map((product: Product) => {
        const variants = Array.isArray(product.variants) ? product.variants : [];
        const images = Array.isArray(product.images) 
          ? product.images.map((img: string | { url?: string }) => typeof img === 'string' ? img : img.url || '')
          : [];

        return {
          id: product.id,
          title: product.title || product.name || 'Product',
          name: product.title || product.name || 'Product',
          price: product.price || 0,
          compareAtPrice: product.compareAtPrice || product.comparePrice,
          images: images,
          category: typeof product.category === 'object' && product.category?.name 
            ? product.category.name 
            : typeof product.category === 'string' 
            ? product.category 
            : product.categoryId || '',
          inStock: variants.some((variant: ProductVariant) => (variant.stockQty ?? 0) > 0),
            isActive: product.isActive === true, // Only show truly active products
          sku: product.sku,
          barcodeUrl: product.barcodeUrl,
          slug: product.slug || product.id,
          variants,
        };
      });

      return NextResponse.json({
        products: transformedProducts,
        pagination: data.data.pagination || {
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '12'),
          total: transformedProducts.length,
          pages: 1,
          hasMore: false
        }
      });
    } else if (data.products) {
      // Already in frontend format
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid response format from backend' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('Error fetching products:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}