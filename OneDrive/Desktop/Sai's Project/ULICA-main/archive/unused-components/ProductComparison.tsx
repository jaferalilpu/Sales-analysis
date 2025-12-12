'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, CheckIcon, XMarkIcon as XIcon } from '@/components/ui/icons';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  description: string;
  details: {
    material: string;
    fit: string;
    weight: string;
    origin: string;
    color: string;
  };
  specifications: {
    weight: string;
    dimensions: string;
    sizes: string[];
  };
  washCare: string[];
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    options: {
      color: string;
      size: string;
    };
  }>;
  inStock: boolean;
  tags: string[];
}

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onAddToCart: (productId: string, variantId: string) => void;
  onAddToWishlist: (productId: string, variantId: string) => void;
}

export function ProductComparison({ 
  products, 
  onRemove, 
  onClear, 
  onAddToCart, 
  onAddToWishlist 
}: ProductComparisonProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set default variants
    const defaultVariants: Record<string, string> = {};
    products.forEach(product => {
      if (product.variants.length > 0) {
        defaultVariants[product.id] = product.variants[0].id;
      }
    });
    setSelectedVariants(defaultVariants);
  }, [products]);

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
  };

  const getSelectedVariant = (productId: string) => {
    const variantId = selectedVariants[productId];
    return products
      .find(p => p.id === productId)
      ?.variants.find(v => v.id === variantId);
  };

  const getComparisonFeatures = () => {
    const features = [
      { key: 'price', label: 'Price', type: 'price' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'fit', label: 'Fit', type: 'text' },
      { key: 'weight', label: 'Weight', type: 'text' },
      { key: 'origin', label: 'Origin', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'dimensions', label: 'Dimensions', type: 'text' },
      { key: 'sizes', label: 'Available Sizes', type: 'list' },
      { key: 'inStock', label: 'In Stock', type: 'boolean' },
      { key: 'washCare', label: 'Wash Care', type: 'list' },
      { key: 'tags', label: 'Tags', type: 'list' }
    ];

    return features;
  };

  const getFeatureValue = (product: Product, feature: any) => {
    const variant = getSelectedVariant(product.id);
    
    switch (feature.key) {
      case 'price':
        return variant ? variant.price : product.price;
      case 'category':
        return product.category;
      case 'material':
        return product.details.material;
      case 'fit':
        return product.details.fit;
      case 'weight':
        return product.details.weight;
      case 'origin':
        return product.details.origin;
      case 'color':
        return variant ? variant.options.color : product.details.color;
      case 'dimensions':
        return product.specifications.dimensions;
      case 'sizes':
        return product.specifications.sizes;
      case 'inStock':
        return product.inStock;
      case 'washCare':
        return product.washCare;
      case 'tags':
        return product.tags;
      default:
        return '';
    }
  };

  const formatValue = (value: any, type: string) => {
    switch (type) {
      case 'price':
        return `₹${value.toLocaleString()}`;
      case 'boolean':
        return value ? (
          <CheckIcon className="w-5 h-5 text-green-500" />
        ) : (
          <XIcon className="w-5 h-5 text-red-500" />
        );
      case 'list':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value;
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products to Compare</h3>
          <p className="text-gray-600">Add products to compare their features and specifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Product Comparison ({products.length} products)
        </h2>
        <button
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Clear All
        </button>
      </div>

      {/* Products */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Product Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {products.map((product) => {
              const variant = getSelectedVariant(product.id);
              return (
                <div key={product.id} className="relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 z-10"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>

                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Name */}
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{variant ? variant.price.toLocaleString() : product.price.toLocaleString()}
                    </span>
                    {variant?.compareAtPrice && variant.compareAtPrice > variant.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{variant.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Variant Selection */}
                  {product.variants.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant
                      </label>
                      <select
                        value={selectedVariants[product.id] || ''}
                        onChange={(e) => handleVariantChange(product.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => onAddToCart(product.id, selectedVariants[product.id])}
                      className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => onAddToWishlist(product.id, selectedVariants[product.id])}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Add to Wishlist
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    {products.map((product) => (
                      <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getComparisonFeatures().map((feature) => (
                    <tr key={feature.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feature.label}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(getFeatureValue(product, feature), feature.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
