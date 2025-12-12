'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  name?: string;
  price: number;
  compareAtPrice?: number;
  comparePrice?: number;
  images: string[] | Array<{url: string; alt?: string}>;
  category?: string;
  inStock?: boolean;
  isActive?: boolean;
  slug?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=50`);
        const data = await response.json();
        
        if (response.ok) {
          // Handle both response formats: {success: true, data: {products: []}} or {products: []}
          const productsList = data.success 
            ? (data.data?.products || [])
            : (data.products || []);
          
          // Transform products to match expected format
          const transformedProducts = productsList.map((product: Product) => {
            // Handle images - can be array of strings or array of objects
            let imageArray: string[] = [];
            if (Array.isArray(product.images)) {
              imageArray = product.images.map((img) => 
                typeof img === 'string' ? img : (typeof img === 'object' && 'url' in img ? img.url : String(img))
              );
            } else if (typeof product.images === 'string') {
              imageArray = [product.images];
            }
            
            // Handle category - can be string or object
            let categoryName = '';
            if (typeof product.category === 'string') {
              categoryName = product.category;
            } else if (product.category && typeof product.category === 'object') {
              const catObj = product.category as { name?: string; id?: string; slug?: string };
              categoryName = catObj.name || '';
            }
            
            return {
              id: product.id,
              title: product.title || product.name || 'Product',
              name: product.title || product.name || 'Product',
              price: product.price || 0,
              compareAtPrice: product.compareAtPrice || product.comparePrice,
              images: imageArray.length > 0 ? imageArray : ['/placeholder-product.jpg'],
              category: categoryName,
              inStock: product.inStock !== false && product.inStock !== undefined ? product.inStock : true,
              isActive: product.isActive !== false,
              slug: product.slug || product.id,
            };
          });
          setProducts(transformedProducts);
        } else {
          setError(data.error || 'Failed to search products');
          setProducts([]);
        }
      } catch (err) {
        
        setError('Failed to search products');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url || '/placeholder-product.jpg';
    }
    return '/placeholder-product.jpg';
  };

  const getProductUrl = (product: Product): string => {
    return `/product/${product.slug || product.id}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search Results for "${query}"` : 'Search Products'}
          </h1>
          {query && (
            <p className="text-gray-600">
              {isLoading ? 'Searching...' : products.length > 0 
                ? `Found ${products.length} product${products.length !== 1 ? 's' : ''}`
                : 'No products found'}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Searching products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/"
              className="text-black hover:text-gray-600 underline"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && query && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No products found matching "{query}"</p>
            <p className="text-gray-500 mb-6">Try searching with different keywords</p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={getProductUrl(product)}
                className="group relative bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 ease-in-out transform block"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100 aspect-[4/5] group-hover:bg-gray-300 transition-colors duration-300">
                  <Image
                    src={getProductImage(product)}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4 text-center">
                  <h3 className="font-medium text-sm text-black mb-3 leading-tight group-hover:text-gray-700 transition-colors duration-300">
                    {product.title}
                  </h3>
                  
                  {/* Pricing */}
                  <div className="mb-3 flex items-center justify-center gap-3">
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="text-xs text-gray-500 font-medium line-through">
                        ₹{product.compareAtPrice.toLocaleString()}
                      </div>
                    )}
                    <div className="text-sm text-black font-bold">
                      ₹{product.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Stock Status */}
                  {product.inStock === false && (
                    <div className="text-xs text-red-600 font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {!query && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Enter a search query to find products</p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

