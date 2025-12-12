'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { PlusIcon, TrashIcon, XMarkIcon } from '@/components/ui/icons';

export interface ImageUrlItem {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

interface ImageUrlManagerProps {
  images: ImageUrlItem[];
  onChange: (images: ImageUrlItem[]) => void;
  helperText?: string;
  maxImages?: number;
}

export function ImageUrlManager({
  images,
  onChange,
  helperText = 'Add image URLs. The first image will be set as primary by default.',
  maxImages = 10,
}: ImageUrlManagerProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const addImage = useCallback(() => {
    if (!newUrl.trim()) {
      return;
    }

    const url = newUrl.trim();
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    const isFirstImage = images.length === 0;
    const newImage: ImageUrlItem = {
      id: crypto.randomUUID(),
      url,
      alt: newAlt.trim() || undefined,
      isPrimary: isFirstImage,
    };

    // If this is the first image, make it primary
    // Otherwise, unset primary from others if this is set as primary
    const updatedImages = isFirstImage
      ? [newImage]
      : images.map((img) => ({ ...img, isPrimary: false })).concat(newImage);

    onChange(updatedImages);
    setNewUrl('');
    setNewAlt('');
  }, [newUrl, newAlt, images, onChange]);

  const removeImage = useCallback(
    (id: string) => {
      const imageToRemove = images.find((img) => img.id === id);
      const updatedImages = images.filter((img) => img.id !== id);

      // If we removed the primary image, make the first remaining image primary
      if (imageToRemove?.isPrimary && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }

      onChange(updatedImages);
    },
    [images, onChange]
  );

  const setPrimary = useCallback(
    (id: string) => {
      onChange(
        images.map((img) => ({
          ...img,
          isPrimary: img.id === id,
        }))
      );
    },
    [images, onChange]
  );

  const handleImageLoad = useCallback((id: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleImageError = useCallback((id: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    // Optionally show error for failed image load
  }, []);

  const handleImageStartLoad = useCallback((id: string) => {
    setLoadingImages((prev) => new Set(prev).add(id));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Product Images</h3>
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>

      {/* Add New Image URL */}
      {images.length < maxImages && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text (optional)
              </label>
              <input
                type="text"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="Product image description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addImage}
                disabled={!newUrl.trim()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image List */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100"
            >
              {/* Image with lazy loading */}
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.alt || `Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  onLoadStart={() => handleImageStartLoad(image.id)}
                  onLoad={() => handleImageLoad(image.id)}
                  onError={() => handleImageError(image.id)}
                  className={`object-cover transition-opacity duration-300 ${
                    loadingImages.has(image.id) ? 'opacity-0' : 'opacity-100'
                  }`}
                  unoptimized={image.url.startsWith('blob:') || image.url.startsWith('data:')}
                />
                {loadingImages.has(image.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrimary(image.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded ${
                    image.isPrimary
                      ? 'bg-white text-black'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } transition-colors`}
                >
                  {image.isPrimary ? 'Primary' : 'Set Primary'}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-black text-white text-xs font-medium rounded">
                  Primary
                </div>
              )}

              {/* URL Preview */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 truncate">
                {image.url}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          No images added yet. Add image URLs above.
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-xs text-gray-500 text-center">
          Maximum {maxImages} images allowed.
        </p>
      )}
    </div>
  );
}

