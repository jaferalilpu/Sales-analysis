'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, useGlobalLoading } from '@/app/providers';
import { ArrowLeftIcon, PencilIcon } from '@/components/ui/icons';
import { showToast } from '@/lib/toast';
import { ImageUrlManager, ImageUrlItem } from '@/components/admin/ImageUrlManager';
import { SizeChartManager, SizeChartEntry } from '@/components/admin/SizeChartManager';
import { ProductDetailsManager, ProductDetails, ProductSpecifications } from '@/components/admin/ProductDetailsManager';
import { ProductImage } from '@/types/product';
import { getErrorMessage } from '@/types/common';

export default function EditProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    price: '',
  });
  const [images, setImages] = useState<ImageUrlItem[]>([]);
  const [sizeChart, setSizeChart] = useState<SizeChartEntry[]>([]);
  const [details, setDetails] = useState<ProductDetails>({
    material: '',
    fit: '',
    weight: '',
    origin: '',
    color: '',
  });
  const [specifications, setSpecifications] = useState<ProductSpecifications>({
    weight: '',
    dimensions: '',
    sizes: [],
  });
  const [washCare, setWashCare] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { showLoading, hideLoading } = useGlobalLoading();

  const loadProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include'
      });

      showLoading('Loading product...');
      if (response.ok) {
        const data = await response.json();
        const product = data.data.product;
        setFormData({
          name: product.title,
          description: product.description || '',
          category: product.category || 'general',
          price: product.variants[0]?.price?.toString() || '0',
        });
        
        // Load images from product
        if (product.images && Array.isArray(product.images)) {
          const loadedImages: ImageUrlItem[] = product.images.map((img: ProductImage | string, index: number) => {
            const imageData = typeof img === 'string' ? { url: img } : img;
            return {
              id: (imageData as ProductImage).id || crypto.randomUUID(),
              url: imageData.url || (typeof img === 'string' ? img : ''),
              alt: (imageData as ProductImage).alt || (imageData as ProductImage).altText || '',
              isPrimary: index === 0 || (imageData as ProductImage).isPrimary || false,
            };
          });
          setImages(loadedImages);
        } else if (product.images && typeof product.images === 'string') {
          // Handle case where images might be a JSON string
          try {
            const parsedImages = JSON.parse(product.images);
            const loadedImages: ImageUrlItem[] = Array.isArray(parsedImages)
              ? parsedImages.map((img: ProductImage | string, index: number) => {
                const imageUrl = typeof img === 'string' ? img : (img.url || '');
                return {
                  id: crypto.randomUUID(),
                  url: imageUrl,
                  alt: typeof img === 'string' ? '' : (img.alt || img.altText || ''),
                  isPrimary: index === 0,
                };
              })
              : [];
            setImages(loadedImages);
          } catch {
            // If parsing fails, treat as single URL
            setImages([{
              id: crypto.randomUUID(),
              url: product.images,
              alt: '',
              isPrimary: true,
            }]);
          }
        }
        
        // Load size chart from product
        if (product.sizeChart && Array.isArray(product.sizeChart)) {
          setSizeChart(product.sizeChart);
        } else if (product.sizeChart && typeof product.sizeChart === 'string') {
          try {
            const parsed = JSON.parse(product.sizeChart);
            setSizeChart(Array.isArray(parsed) ? parsed : []);
          } catch {
            setSizeChart([]);
          }
        } else {
          setSizeChart([]);
        }
        
        // Load details from product
        if (product.details && typeof product.details === 'object') {
          setDetails({
            material: product.details.material || '',
            fit: product.details.fit || '',
            weight: product.details.weight || '',
            origin: product.details.origin || '',
            color: product.details.color || '',
          });
        }
        
        // Load specifications from product
        if (product.specifications && typeof product.specifications === 'object') {
          setSpecifications({
            weight: product.specifications.weight || '',
            dimensions: product.specifications.dimensions || '',
            sizes: Array.isArray(product.specifications.sizes) ? product.specifications.sizes : [],
          });
        }
        
        // Load wash care from product
        if (product.washCare && Array.isArray(product.washCare)) {
          setWashCare(product.washCare);
        } else {
          setWashCare([]);
        }
      } else {
        showToast.error('Failed to load product.');
        router.push('/admin/products');
      }
    } catch (error) {
      
      showToast.error('Error loading product.');
      router.push('/admin/products');
    } finally {
      setIsLoadingProduct(false);
      hideLoading();
    }
  }, [productId, router, showLoading, hideLoading]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    loadProduct();
  }, [user, router, loadProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price) || 0,
          images: images.map((img, index) => ({
            url: img.url,
            alt: img.alt || '',
            isPrimary: img.isPrimary || (index === 0 && !images.some(i => i.isPrimary)),
          })),
          sizeChart: sizeChart.length > 0 ? sizeChart : undefined,
          details: Object.values(details).some(v => v.trim()) ? details : undefined,
          specifications: Object.values(specifications).some(v => Array.isArray(v) ? v.length > 0 : v.trim()) ? specifications : undefined,
          washCare: washCare.filter(i => i.trim()).length > 0 ? washCare.filter(i => i.trim()) : undefined,
        })
      });

      showLoading('Updating product...');
      if (response.ok) {
        showToast.success('Product updated successfully.');
        router.push('/admin/products');
      } else {
        showToast.error('Failed to update product.');
      }
    } catch (error) {
      
      showToast.error('Error updating product.');
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Edit Product
          </h1>
          <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Update product information
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="general">General</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Product Images
            </label>
            <ImageUrlManager
              images={images}
              onChange={setImages}
              helperText="Add multiple image URLs. Images load lazily to improve page performance."
              maxImages={10}
            />
          </div>

          <div>
            <SizeChartManager
              sizeChart={sizeChart}
              onChange={setSizeChart}
            />
          </div>

          <div>
            <ProductDetailsManager
              details={details}
              specifications={specifications}
              washCare={washCare}
              onDetailsChange={setDetails}
              onSpecificationsChange={setSpecifications}
              onWashCareChange={setWashCare}
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}