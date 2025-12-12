'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  PhotoIcon,
  ClockIcon,
  UserIcon
} from '@/components/ui/icons';
import { Product } from '@/types/product';
import { Drop, DropFormData } from '@/types/drop';
import { getErrorMessage } from '@/types/common';

export default function EditDropPage() {
  const router = useRouter();
  const params = useParams();
  const dropId = params.id as string;
  const { showLoading, hideLoading } = useGlobalLoading();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bannerImage: '',
    bannerVideo: '',
    startDate: '',
    endDate: '',
    productIds: [] as string[],
    purchaseLimitPerCustomer: '',
    isPublished: false
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDrop = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/drops/${dropId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const drop: Drop = data.data?.drop || data.data || data.drop;
        
        if (!drop) {
          
          showToast.error('Failed to load drop: No drop data found.');
          router.push('/admin/drops');
          return;
        }

        // Format dates for datetime-local input
        const startDate = new Date(drop.startDate);
        const endDate = new Date(drop.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          
          showToast.error('Drop has invalid dates. Please contact support.');
          router.push('/admin/drops');
          return;
        }
        
        const formatDateTimeLocal = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          name: drop.name || '',
          description: drop.description || '',
          bannerImage: drop.bannerImage || '',
          bannerVideo: drop.bannerVideo || '',
          startDate: formatDateTimeLocal(startDate),
          endDate: formatDateTimeLocal(endDate),
          productIds: drop.dropProducts?.map(dp => dp?.product?.id).filter(Boolean) || [],
          purchaseLimitPerCustomer: drop.purchaseLimitPerCustomer?.toString() || '',
          isPublished: drop.isPublished || false
        });
      } else {
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        
        showToast.error(`Failed to load drop: ${errorMessage}`);
        router.push('/admin/drops');
      }
    } catch (error) {
      
      showToast.error(
        `Failed to load drop: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      router.push('/admin/drops');
    } finally {
      setIsLoading(false);
    }
  }, [dropId, router]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
      } else {
        showToast.error('Failed to load products for this drop.');
      }
    } catch (error) {
      
      showToast.error('Failed to fetch products. Please refresh and try again.');
    }
  }, []);

  useEffect(() => {
    fetchDrop();
    fetchProducts();
  }, [fetchDrop, fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file');
      return;
    }

    // For now, we'll create a preview but not upload
    // In production, you'd upload to your image service and get a URL
    const imageUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, bannerImage: imageUrl }));
    
    // Note: The bannerImage will be excluded from submission if it's a blob URL
    // You'll need to implement actual image upload to get a proper URL
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      showToast.error('Please upload a video file');
      return;
    }

    // For now, we'll create a preview but not upload
    // In production, you'd upload to your video service and get a URL
    const videoUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, bannerVideo: videoUrl }));
    
    // Note: The bannerVideo will be excluded from submission if it's a blob URL
    // You'll need to implement actual video upload to get a proper URL
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      showToast.error('Please enter a drop name (at least 2 characters).');
      return;
    }

    if (!formData.startDate) {
      showToast.error('Please select a start date.');
      return;
    }

    if (!formData.endDate) {
      showToast.error('Please select an end date.');
      return;
    }

    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(formData.endDate);

    if (endDateObj <= startDateObj) {
      showToast.error('End date must be after the start date.');
      return;
    }

    setIsSubmitting(true);
    showLoading('Updating drop...');

    try {
      // Prepare data for submission
      const submitData: Partial<DropFormData> & { startDate: string; endDate: string } = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        productIds: formData.productIds.length > 0 ? formData.productIds : undefined,
        purchaseLimitPerCustomer: formData.purchaseLimitPerCustomer 
          ? parseInt(formData.purchaseLimitPerCustomer) 
          : undefined,
        isPublished: formData.isPublished || false
      };

      // Only include bannerImage if it's a valid URL (not a blob URL)
      if (formData.bannerImage && !formData.bannerImage.startsWith('blob:')) {
        submitData.bannerImage = formData.bannerImage;
      }
      
      // Only include bannerVideo if it's a valid URL (not a blob URL)
      if (formData.bannerVideo && !formData.bannerVideo.startsWith('blob:')) {
        submitData.bannerVideo = formData.bannerVideo;
      }

      const response = await fetch(`/api/admin/drops/${dropId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast.success('Drop updated successfully.');
        router.push('/admin/drops');
      } else {
        const errorMessage = data.error || data.message || 'Failed to update drop';
        
        showToast.error(`Failed to update drop: ${errorMessage}`);
      }
    } catch (error) {
      
      showToast.error(
        `Failed to update drop: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black dark:border-white"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading drop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Edit Drop
          </h1>
          <p className="text-gray-600 mt-2 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Update drop information and settings
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Drop Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    placeholder="e.g., Summer Collection 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    placeholder="Describe your drop..."
                  />
                </div>
              </div>
            </div>

            {/* Banner Media (Image & Video) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Banner Media
              </h3>
              <div className="space-y-6">
                {/* Banner Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Banner Image (Optional)
                  </label>
                  <label htmlFor="banner-image-upload-edit" className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                      <span className="mt-2 block text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        Upload banner image
                      </span>
                        <p className="mt-1 text-xs text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          PNG, JPG, GIF, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                      <input
                      id="banner-image-upload-edit"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                {formData.bannerImage && (
                  <div className="mt-4 relative w-full h-32 rounded-lg overflow-hidden">
                    <Image
                      src={formData.bannerImage}
                        alt="Banner image preview"
                      fill
                      sizes="100vw"
                      className="object-cover rounded-lg"
                      unoptimized={formData.bannerImage.startsWith('blob:') || formData.bannerImage.startsWith('data:')}
                    />
                  </div>
                )}
                </div>

                {/* Banner Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Banner Video (Optional)
                  </label>
                  <label htmlFor="banner-video-upload-edit" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div className="mt-4">
                        <span className="mt-2 block text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          Upload banner video
                        </span>
                        <p className="mt-1 text-xs text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          MP4, WEBM, MOV up to 50MB
                        </p>
                      </div>
                    </div>
                    <input
                      id="banner-video-upload-edit"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="sr-only"
                    />
                  </label>
                  {formData.bannerVideo && (
                    <div className="mt-4 relative w-full h-32 rounded-lg overflow-hidden bg-black">
                      <video
                        src={formData.bannerVideo}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Note: If both image and video are provided, video will be displayed with image as poster/fallback.
                </p>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Assign Products
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.productIds.includes(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          {product.images?.[0] && (
                            <div className="h-10 w-10 relative rounded-lg overflow-hidden">
                              <Image
                                className="object-cover"
                                src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || '')}
                                alt={product.title || 'Product'}
                                width={40}
                                height={40}
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                              {product.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {formData.productIds.length} product{formData.productIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Purchase Limit per Customer
                  </label>
                  <input
                    type="number"
                    name="purchaseLimitPerCustomer"
                    value={formData.purchaseLimitPerCustomer}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    placeholder="No limit"
                  />
                  <p className="mt-1 text-xs text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Leave empty for no limit
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Publish immediately
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-xl hover:from-gray-800 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  {isSubmitting ? 'Updating...' : 'Update Drop'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

